import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import CourseQuizPractice from '../../components/practice/CourseQuizPractice'

export default function QuizSessionPage() {
  return (
    <ProtectedRoute>
      <Layout title="Quiz">
        <QuizSessionInner />
      </Layout>
    </ProtectedRoute>
  )
}

function QuizSessionInner() {
  return <CourseQuizPractice />
}
