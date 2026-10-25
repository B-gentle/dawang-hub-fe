interface AvatarProps {
  firstName?: string;
  lastName?: string;
  className?: string;
}

export function Avatar({
  firstName = "",
  lastName = "",
  className = "",
}: AvatarProps) {
  const getInitials = () => {
    const firstInitial = firstName.trim()[0] || "";
    const lastInitial = lastName.trim()[0] || "";
    const initials = `${firstInitial}${lastInitial}`.toUpperCase();
    return initials || "BE";
  };

  return (
    <div
      className={`w-8 h-8 rounded-full bg-[#EAE2D8] text-[#8C6B4F] text-xs font-bold flex items-center justify-center border border-[#D1C6B8] shrink-0 select-none ${className}`}
    >
      {getInitials()}
    </div>
  );
}
