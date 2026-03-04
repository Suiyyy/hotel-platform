import { Text } from '@tarojs/components'

const StarRating = ({ star, max = 5 }) => {
  const stars = []
  for (let i = 0; i < max; i++) {
    stars.push(
      <Text key={i} className={`star ${i < star ? 'star-filled' : ''}`}>★</Text>
    )
  }
  return <>{stars}</>
}

export default StarRating
