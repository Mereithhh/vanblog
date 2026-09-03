import { daysAgo } from "../../utils/relativeTime";

// TODO: support expiration time
export default function (props: {
  updatedAt: Date;
  createdAt: Date;
  showExpirationReminder?: boolean;
  expirationDays?: number;
}) {
  if (props.showExpirationReminder) {
    const diff = daysAgo(props.createdAt);

    if (diff > (props.expirationDays || 30)) {
      return (
        <div className="warning-card text-gray-600 dark:text-dark">
          <div>
            请注意，本文编写于 {diff} 天前，最后修改于 {daysAgo(props.updatedAt)}{" "}
            天前，其中某些信息可能已经过时。
          </div>
        </div>
      );
    }
  }

  return null;
}
