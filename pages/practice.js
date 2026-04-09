import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import CourseQuizPractice from '../components/practice/CourseQuizPractice'

export default function PracticePage() {
  return (
    <ProtectedRoute>
      <Layout title="Quiz mode">
        <CourseQuizPractice />
      </Layout>
    </ProtectedRoute>
  )
}
