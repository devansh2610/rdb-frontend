import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faSort } from "@fortawesome/free-solid-svg-icons";

export default function SortableTableHeader({
  headerType,
  headerFullName,
  handleSorting,
  dir = 0,
}) {
  // Default value of direction is 0, i.e. no type of sorting
  // 1 -> Ascending order
  // -1 -> Descending order
  const [direction, setDirection] = useState(dir);

	// Icon
  let Icon = null;
  switch (direction) {
		case 0:
			Icon = <FontAwesomeIcon icon={faSort} />;
			break;
    case 1:
      Icon = <FontAwesomeIcon icon={faArrowDown} />;
      break;
    case -1:
      Icon = <FontAwesomeIcon icon={faArrowUp} />;
      break;
		default:
			break;
  }

  return (
    <button
      className="flex flex-row gap-2 hover:cursor-pointer"
      onClick={() => {
        const newDirection = direction == 0 ? 1 : -1 * direction;
        handleSorting(headerType, newDirection);
        setDirection(newDirection);
      }}
    >
      <p>{headerFullName}</p>
      {Icon}
    </button>
  );
}
