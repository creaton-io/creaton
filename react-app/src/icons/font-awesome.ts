import { IconProp, library } from '@fortawesome/fontawesome-svg-core'
import {
    far,
} from '@fortawesome/free-regular-svg-icons'

import {
    fab,
    faTwitter,
    faGithub,
} from '@fortawesome/free-brands-svg-icons'

import {
  fas, faHeart, faEllipsisH, faTimes, faCheck, faExclamation, faInfo, faCog, faQuestion, faUser, faLock, faFlag
} from "@fortawesome/free-solid-svg-icons";

const farIcons = [
]

const fasIcons = [
  faHeart,
  faEllipsisH,
  faTimes,
  faCheck,
  faExclamation,
  faInfo,
  faCog,
  faQuestion,
  faUser,
  faLock,
  faFlag
]

const fabIcons = [
    faTwitter,
    faGithub,
]

export const iconMap: { [key: string]: any } = {
  'heart': ['fas', 'heart'],
  'ellipsis-h': ['fas', 'ellipsis-h'],
  'search': ['fas', 'search'],
  'bell': ['fas', 'bell'],
  'share': ['fas', 'share-alt'],
  'check': ['fas', 'check'],
  'times': ['fas', 'times'],
  'exclamation': ['fas', 'exclamation'],
  'info': ['fas', 'info'],
  'cog': ['fas', 'cog'],
  'question': ['fas', 'question'],
  'question-circle': ['fas', 'question-circle'],
  'user': ['fas', 'user'],
  'lock': ['fas', 'lock'],
  'flag': ['fas', 'flag'],
  'eye': ['fas', 'eye'],
  'eye-slash': ['fas', 'eye-slash'],


  // branding
  'github': ['fab', 'github'],
  'twitter': ['fab', 'twitter'],
  'medium': ['fab', 'medium-m'],
  'telegram': ['fab', 'telegram']
}

export const resolveIconAlias = (name: string): IconProp => (
    iconMap[name] ? iconMap[name] : iconMap['default']
)

// @ts-ignore
export const initFontAwesome = () => {
// @ts-ignore
    library.add(fas, ...fasIcons)
// @ts-ignore
    library.add(far, ...farIcons)
// @ts-ignore
    library.add(fab, ...fabIcons)
}

