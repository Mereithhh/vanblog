export default function (props: { type: "search" | "esc" }) {
  if (props.type == "search") {
    return (
      <div className="flex items-center">
        <span
          style={{ opacity: 1, height: 24 }}
          className="hidden sm:block text-gray-500 text-sm leading-5 py-0.5 px-1.5 border border-gray-300 rounded-md dark:text-dark dark:border-dark"
        >
          <span className="sr-only">Press </span>
          <kbd className="font-sans">
            <abbr title="Control" className="no-underline">
              Ctrl{" "}
            </abbr>
          </kbd>
          <span className="sr-only"> and </span>
          <kbd className="font-sans">K</kbd>
          <span className="sr-only"> to search</span>
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center select-none ml-2">
        <span
          style={{ opacity: 1, height: 24, lineHeight: "17.73px" }}
          className="hidden sm:block text-gray-500 text-sm leading-5 py-0.5 px-1.5 border border-gray-300 rounded-md dark:text-dark dark:border-dark"
        >
          <span className="sr-only">Press </span>
          <kbd className="font-sans">esc</kbd>
          <span className="sr-only"> to close</span>
        </span>
      </div>
    );
  }
}
