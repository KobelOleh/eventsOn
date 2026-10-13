import SvgIcon from "@mui/material/SvgIcon";

export function MailIcon() {
  return (
    <SvgIcon fontSize="small" sx={{ color: "text.secondary" }}>
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
    </SvgIcon>
  );
}

export function LockIcon() {
  return (
    <SvgIcon fontSize="small" sx={{ color: "text.secondary" }}>
      <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2ZM9 6a3 3 0 0 1 6 0v2H9V6Z" />
    </SvgIcon>
  );
}

export function GoogleMark() {
  return (
    <SvgIcon fontSize="small">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.7-.06-1.37-.18-2H12v3.78h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.74 2.99-4.3 2.99-7.3Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.96-3.4.96-2.6 0-4.8-1.76-5.58-4.12H3.08v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.42 13.9a6 6 0 0 1 0-3.8V7.52H3.08a10 10 0 0 0 0 8.96l3.34-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.97 9.97 0 0 0 12 2 10 10 0 0 0 3.08 7.52l3.34 2.58C7.2 7.74 9.4 5.98 12 5.98Z"
      />
    </SvgIcon>
  );
}
