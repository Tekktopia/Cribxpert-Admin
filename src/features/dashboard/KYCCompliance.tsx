// src/features/dashboard/KYCCompliance.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { getStatusVariant, getStatusLabel } from "@/utils/statusBadges";
import { getInitials, normalizeAvatarSrc, safeText } from "@/utils/userDisplay";

interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  status: "verified" | "pending" | "blocked" | "flagged";
  role?: string;
  timestamp?: string;
}

interface KYCComplianceProps {
  users: User[];
}

export function KYCCompliance({ users }: KYCComplianceProps) {
  return (
    <Card className="p-5">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-semibold">
          KYC &amp; Compliance
        </CardTitle>
        <p className="text-xs text-gray-400 mt-0.5">Users awaiting review</p>
      </CardHeader>

      <CardContent className="p-0">
        {users.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No pending users
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((user, idx) => {
              const displayName = safeText(
                user.name ?? user.email,
                "Unknown User"
              );
              const initials = getInitials(user.name ?? user.email, "U");
              const avatarSrc = normalizeAvatarSrc(user.avatar);

              return (
                <div
                  key={`${user.id ?? user.email ?? "user"}-${idx}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarImage src={avatarSrc} alt={displayName} />
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayName}
                      </p>
                      {user.timestamp && (
                        <p className="text-xs text-gray-400">{user.timestamp}</p>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={getStatusVariant(user.status, "kyc")}
                    className="flex-shrink-0 ml-2"
                  >
                    {getStatusLabel(user.status, "kyc")}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
