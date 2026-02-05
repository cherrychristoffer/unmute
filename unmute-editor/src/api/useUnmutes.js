import { useSelector } from 'react-redux'

export const useActiveUnmute = () => {
  const activeUnmuteIndex = useSelector((state) => state.user.activeUnmuteIndex)

  const unmutes = useSelector((state) => state.user.unmutes)

  return {
    activeUnmuteIndex,
    activeUnmute: unmutes[activeUnmuteIndex],
    loading: activeUnmuteIndex === null,
  }
}
