export default function Hr ({classes = ""}: {classes?: string}) {
  return <hr className={"h-px my-4 bg-gray-200 border-0 dark:bg-gray-700 " + classes} />;
}
