import { BigInt, Bytes, store } from '@graphprotocol/graph-ts';
import { CaseBuilt, CaseClosed, CaseRewardsDistributed, ContentReported, JurorAdded, JurorRemoved, JurorSlashed, JurorVoted, JuryAssigned, JuryReassigned } from '../generated/Moderation/Moderation';
import { Juror, JurorDecision, ModerationCase, ReportedContent } from '../generated/schema';

export function handleContentReported(event: ContentReported): void {
    let reportedContent = ReportedContent.load(event.params.contentId);
    if(reportedContent === null){   
        reportedContent = new ReportedContent(event.params.contentId);
        reportedContent.contentId = event.params.contentId;
        reportedContent.content = event.params.contentId;
        reportedContent.reporters = [event.transaction.from];
        reportedContent.staked = event.params.staked;
        reportedContent.reportersStaked = [event.params.staked];
        reportedContent.reportersRewarded = [BigInt.fromI32(0)];
        reportedContent.reportersPenalized = [BigInt.fromI32(0)];
        reportedContent.fileProofs = [event.params.fileProof];
        reportedContent.creators = [event.transaction.from.toHex()];
    }else{
        reportedContent.staked = reportedContent.staked.plus(event.params.staked);

        let reporters = reportedContent.reporters;
        reporters.push(event.transaction.from);
        reportedContent.reporters = reporters;

        let fileProofs = reportedContent.fileProofs;
        fileProofs.push(event.params.fileProof);
        reportedContent.fileProofs = fileProofs;

        let creators = reportedContent.creators;
        creators.push(event.transaction.from.toHex());
        reportedContent.creators = creators;

        let reportersStaked = reportedContent.reportersStaked;
        reportersStaked.push(event.params.staked);
        reportedContent.reportersStaked = reportersStaked;
    }

    reportedContent.save();
}

export function handleJurorAdded(event: JurorAdded): void {
    let juror = Juror.load(event.params.juror.toHex());
    if(juror === null){   
        juror = new Juror(event.params.juror.toHex());
    }
    
    juror.initialStaked = event.params.staked;
    juror.staked = event.params.staked;
    juror.address = event.params.juror;
    juror.status = "idle";
    juror.save();
}

export function handleJurorRemoved(event: JurorRemoved): void {
    store.remove("Juror", event.params.juror.toHex());
}

export function handleCaseBuilt(event: CaseBuilt): void {
    let id = "case-" + event.params.contentId;

    let entity = ModerationCase.load(id);
    if(entity === null){   
        entity = new ModerationCase(id);
    }

    entity.content = event.params.contentId;
    entity.status = "new";
    entity.jurySize = BigInt.fromI32(0);
    entity.pendingVotes = BigInt.fromI32(0);
    entity.timestamp = event.params.timestamp;
    entity.totalReward = BigInt.fromI32(0);
    entity.totalPenalty = BigInt.fromI32(0);
    
    entity.save();
}

export function handleJuryAssigned(event: JuryAssigned): void {
    let jurorAddress: Bytes;
    let jury = event.params.jury;
    let juryHex: Array<string> = [];
    for(let i=0; i<event.params.jury.length; i++){
        jurorAddress = jury.pop();
        juryHex.push(jurorAddress.toHex());
        let jurorDecisionId = jurorAddress.toHex() + "-" + event.params.contentId;
        let entity = JurorDecision.load(jurorDecisionId);
        if(entity === null){
            entity = new JurorDecision(jurorDecisionId);
            entity.moderationCase = "case-" + event.params.contentId;
            entity.juror = jurorAddress.toHex();
            entity.decision = "undefined";
            entity.timestamp = event.params.timestamp;
            entity.save();
        }

        let juror = Juror.load(jurorAddress.toHex());
        juror.status = "active";
        juror.save();
    }

    let mCase = ModerationCase.load("case-" + event.params.contentId);
    mCase.status = "jury assigned";
    mCase.jurors = juryHex.join('-');
    mCase.jurySize = BigInt.fromI32(event.params.jury.length);
    mCase.pendingVotes = BigInt.fromI32(event.params.jury.length);
    mCase.save();
}

export function handleJuryReassigned(event: JuryReassigned): void {
    let moderationCaseId = "case-" + event.params.contentId;
    let moderationCase = ModerationCase.load(moderationCaseId);

    for(let i=0; i<moderationCase.jurorDecisions.length; i++){
        let jDecisionId = moderationCase.jurorDecisions.pop();
        let jDecision = JurorDecision.load(jDecisionId);
        if(jDecision.decision == "undefined"){
            store.remove("JurorDecision", jDecisionId);
        }
    }

    moderationCase = ModerationCase.load(moderationCaseId);
    let jurorAddress: Bytes;
    let jury = event.params.jury;
    for(let i=0; i<jury.length; jurorAddress.toHex()){
        jurorAddress = jury.pop();
        let jurorDecisionId = jurorAddress.toHex() + "-" + event.params.contentId;
        if(moderationCase.jurorDecisions.indexOf(jurorDecisionId) < 0){
            let entity = JurorDecision.load(jurorDecisionId);
            if(entity === null){
                entity = new JurorDecision(jurorDecisionId);
                entity.moderationCase = moderationCaseId;
                entity.juror = jurorAddress.toHex();
                entity.decision = "undefined";
                entity.timestamp = event.params.timestamp;
                entity.save();
            }
        }
    }
}

export function handleJurorVoted(event: JurorVoted): void {
    let jurorDecisionId = event.params.juror.toHex() + "-" + event.params.contentId;
    let jDecision = JurorDecision.load(jurorDecisionId);
    let decision = "OK";
    if(event.params.vote == BigInt.fromI32(3)){
        decision = "KO";
    }
    jDecision.decision = decision;
    jDecision.save();

    let mCase = ModerationCase.load("case-" + event.params.contentId);
    mCase.pendingVotes = mCase.pendingVotes.minus(BigInt.fromI32(1));
    mCase.save();

    let juror = Juror.load(event.params.juror.toHex());
    juror.status = "idle";
    juror.save();
}

export function handleCaseClosed(event: CaseClosed): void {
    let mCase = ModerationCase.load("case-" + event.params.contentId);
    mCase.status = "ruled";
    mCase.save();

    if(event.params.votedKO > event.params.votedOK){
        store.remove("Content", event.params.contentId);
    }
}

export function handleJurorSlashed(event: JurorSlashed): void {
    let juror = Juror.load(event.params.juror.toHex());
    juror.staked = juror.staked.minus(event.params.penalty);
    juror.save();
}

export function handleCaseRewardsDistributed(event: CaseRewardsDistributed): void {
    let mCase = ModerationCase.load("case-" + event.params.contentId);
    mCase.status = "rewards distributed";
    mCase.totalReward = event.params.totalReportersRewards;
    mCase.totalPenalty = event.params.totalReportersPenalty;
    mCase.save();

    let jury = event.params.jury;
    let juryRewards = event.params.juryRewards;
    for(let i=0; i<jury.length; i++){
        let juror = Juror.load(jury[i].toHex());
        juror.staked = juror.staked.plus(juryRewards[i]);
        juror.save();
    }

    let reportedContent = ReportedContent.load(event.params.contentId);
    let rep = event.params.reporters;
    let repRewards = event.params.reportersRewards;
    let repPenalty = event.params.reportersPenalty;
    let reportersRewarded = reportedContent.reportersRewarded;
    let reportersPenalized = reportedContent.reportersPenalized;
    for(let i=0; i<rep.length; i++){
        reportersRewarded.push(repRewards[i]);
        reportersPenalized.push(repPenalty[i]);
    }

    reportedContent.reportersRewarded = reportersRewarded;
    reportedContent.reportersPenalized = reportersPenalized;
    reportedContent.save();
}