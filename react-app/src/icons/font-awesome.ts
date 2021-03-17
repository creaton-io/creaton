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
    fas,
    faHeart,
    faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";

const farIcons = [
]

const fasIcons = [
    faHeart,
    faEllipsisH,
]

const fabIcons = [
    faTwitter,
    faGithub,
]

export const iconMap: { [key: string]: any } = {
    'heart': ['fas', 'heart'],
    'ellipsis-h': ['fas', 'ellipsis-h'],

    // branding
    'github': ['fab', 'github'],
    'twitter': ['fab', 'twitter'],
}

export const resolveIconAlias = (name: string): IconProp => (
    iconMap[name] ? iconMap[name] : iconMap['default']
)

export const initFontAwesome = () => {
    library.add(fas, ...fasIcons)
    library.add(far, ...farIcons)
    library.add(fab, ...fabIcons)
}

