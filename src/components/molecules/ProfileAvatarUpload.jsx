export default function ProfileAvatarUpload({
  profilePhoto,
  email,
  isUploading,
  onChange,
}) {
  return (
    <div className="mb-4 flex items-center gap-4">
      {profilePhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profilePhoto}
          alt="Profile"
          className="h-14 w-14 rounded-full border border-slate-300 object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-sm font-semibold text-slate-700">
          {(email?.[0] || 'U').toUpperCase()}
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
        {isUploading ? 'Uploading…' : 'Upload photo'}
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onChange}
          disabled={isUploading}
        />
      </label>
    </div>
  )
}
