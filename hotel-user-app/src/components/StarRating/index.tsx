import { Text } from '@tarojs/components'

interface StarRatingProps {
  star: number
  max?: number
}

const StarRating = ({ star, max = 5 }: StarRatingProps) => {
  const stars: JSX.Element[] = []
  for (let i = 0; i < max; i++) {
    stars.push(
      <Text key={i} className={`star ${i < star ? 'star-filled' : ''}`}>★</Text>
    )
  }
  return <>{stars}</>
}

export default StarRating
