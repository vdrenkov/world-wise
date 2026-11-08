import { useNavigate } from "react-router";

import Button from "./Button";

function BackButton() {
  const navigate = useNavigate();

  return (
    <Button
      type="back"
      onClick={async (event) => {
        event.preventDefault();
        await navigate(-1);
      }}
    >
      &larr; Back
    </Button>
  );
}

export default BackButton;
