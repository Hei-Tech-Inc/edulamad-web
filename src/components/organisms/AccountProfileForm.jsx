import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import FormLabel from '../atoms/FormLabel'
import TextField from '../atoms/TextField'
import ProfileAvatarUpload from '../molecules/ProfileAvatarUpload'

export default function AccountProfileForm({
  profile,
  form,
  onChange,
  onSubmit,
  onPhotoChange,
  isSaving,
  isUploading,
  isLoading,
}) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white">
      <CardContent className="p-6">
        <ProfileAvatarUpload
          profilePhoto={profile?.profilePhoto}
          email={profile?.email}
          isUploading={isUploading}
          onChange={onPhotoChange}
        />

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField id="email" value={profile?.email || ''} disabled />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormLabel htmlFor="firstName">First name</FormLabel>
              <TextField
                id="firstName"
                value={form.firstName}
                onChange={(e) => onChange('firstName', e.target.value)}
              />
            </div>
            <div>
              <FormLabel htmlFor="lastName">Last name</FormLabel>
              <TextField
                id="lastName"
                value={form.lastName}
                onChange={(e) => onChange('lastName', e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSaving || isLoading}
            className="h-11 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
