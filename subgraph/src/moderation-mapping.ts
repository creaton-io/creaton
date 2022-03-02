import { BigInt, Bytes, store } from '@graphprotocol/graph-ts';
import { CaseBuilt, CaseClosed, ContentReported, JurorAdded, JurorRemoved, JurorSlashed, JurorVoted, JuryAssigned, JuryReassigned } from '../generated/Moderation/Moderation';
import { Juror, JurorDecision, ModerationCase, ReportedContent } from '../generated/schema';

export function handleContentReported(event: ContentReported): void {
    let reportedContent = ReportedContent.load(event.params.contentId);
    if(reportedContent === null){   
        reportedContent = new ReportedContent(event.params.contentId);
        reportedContent.contentId = event.params.contentId;
        reportedContent.content = event.params.contentId;
        reportedContent.reporters = [event.transaction.from];
        reportedContent.staked = event.params.staked;
    }else{
        reportedContent.reporters.push(event.transaction.from);
        reportedContent.staked = reportedContent.staked.plus(event.params.staked);
    }

    reportedContent.save();
}

export function handleJurorAdded(event: JurorAdded): void {
    let juror = Juror.load(event.params.juror.toHex());
    if(juror === null){   
        juror = new Juror(event.params.juror.toHex());
    }
    
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
    entity.save();
}

export function handleJuryAssigned(event: JuryAssigned): void {
    let jurorAddress: Bytes;
    let jury = event.params.jury;
    let jurorsConcat: string;
    for(let i=0; i<jury.length; i++){
        jurorAddress = jury.pop();
        jurorsConcat = jurorsConcat + "-" + jurorAddress.toHex();
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
    mCase.jurors = jurorsConcat;
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
    if(event.params.vote == BigInt.fromI32(2)){
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
    let mCase = ModerationCase.load(event.params.contentId);
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