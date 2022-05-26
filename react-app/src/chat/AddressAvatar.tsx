import Blockies from 'react-blockies'

type AvatarProps = {
  peerAddress: string
}

const AddressAvatar = ({ peerAddress }: AvatarProps) => (
  <Blockies seed={peerAddress} size={10} className="rounded-full" />
)

export default AddressAvatar
