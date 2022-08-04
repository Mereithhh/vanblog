import dayjs from "dayjs";
export default function (props: { updatedAt: Date; createdAt: Date }) {
  const today = dayjs();
  const diff = today.diff(props.createdAt, "days");
  if (diff > 30) {
    return (
      <div className="warning-card text-gray-600 dark:text-dark">
        <div>
          请注意，本文编写于 {diff} 天前，最后修改于{" "}
          {today.diff(props.updatedAt, "days")} 天前，其中某些信息可能已经过时。
        </div>
      </div>
    );
  }
  return null;
}
