import SkeletonBox from './SkeletonBox'

const row = 'flex items-center'

export function SkeletonQuestionCard() {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <SkeletonBox width="80%" height={16} borderRadius={4} />
      <SkeletonBox width="55%" height={12} borderRadius={4} />
      <div className={row}>
        <SkeletonBox width={60} height={22} borderRadius={11} />
      </div>
      <div className="flex items-center gap-3">
        <SkeletonBox width="36%" height={12} borderRadius={4} />
        <SkeletonBox width="28%" height={12} borderRadius={4} />
      </div>
    </div>
  )
}

export function SkeletonQuestionDetail() {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <SkeletonBox width="100%" height={20} borderRadius={4} />
      <div className="space-y-2.5">
        <SkeletonBox width="100%" height={14} borderRadius={4} />
        <SkeletonBox width="100%" height={14} borderRadius={4} />
        <SkeletonBox width="80%" height={14} borderRadius={4} />
        <SkeletonBox width="40%" height={14} borderRadius={4} />
      </div>
      <SkeletonBox width="100%" height={120} borderRadius={8} />
    </div>
  )
}

export function SkeletonCourseCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <SkeletonBox width={44} height={44} borderRadius={22} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <SkeletonBox width="70%" height={16} borderRadius={4} />
        <SkeletonBox width="45%" height={12} borderRadius={4} />
      </div>
    </div>
  )
}

export function SkeletonExamCard() {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <SkeletonBox width="90%" height={18} borderRadius={4} />
      <SkeletonBox width="50%" height={12} borderRadius={4} />
      <SkeletonBox width="35%" height={12} borderRadius={4} />
      <SkeletonBox width="100%" height={6} borderRadius={3} />
    </div>
  )
}

export function SkeletonLeaderboardRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <SkeletonBox width={28} height={28} borderRadius={4} />
      <SkeletonBox width={36} height={36} borderRadius={18} />
      <div className="min-w-0 flex-1">
        <SkeletonBox width="55%" height={14} borderRadius={4} />
      </div>
      <SkeletonBox width="20%" height={14} borderRadius={4} />
    </div>
  )
}

export function SkeletonProfileHeader() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <SkeletonBox width={72} height={72} borderRadius={36} />
      <SkeletonBox width="50%" height={18} borderRadius={4} />
      <SkeletonBox width="35%" height={13} borderRadius={4} />
    </div>
  )
}

export function SkeletonNotificationRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <SkeletonBox width={40} height={40} borderRadius={20} />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBox width="65%" height={14} borderRadius={4} />
        <SkeletonBox width="80%" height={12} borderRadius={4} />
      </div>
      <SkeletonBox width="25%" height={11} borderRadius={4} />
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <SkeletonBox width="60%" height={12} borderRadius={4} />
      <SkeletonBox width="40%" height={28} borderRadius={4} />
    </div>
  )
}
