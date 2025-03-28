import { useState } from "react";
import hm_logo from "./assets/HM_PureWhite_Transparent.png";
import Dropdown from "./Dropdown";
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-black shadow-md">
      <div className="container mx-auto flex justify-between items-center p-5">
        <h1 className="text-white text-2xl font-bold">HackMelbourne</h1>
        <img src={hm_logo} alt="logo" width={50} height={50}/>
      </div>
      <Dropdown/>
    </nav>
  );
}

export default Navbar;
