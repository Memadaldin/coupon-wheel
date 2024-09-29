import React, { useRef } from "react";
import CouponWheel, { CouponWheelRef } from "./components/coupon-wheel";

function App() {
  const wheelRef = useRef<CouponWheelRef>(null);
  const [wheelResult, setWheelResult] = React.useState("");

  const handleSpinClick = () => {
    wheelRef.current?.spinWheel();
  };

  const handleSpinFinish = (result: string) => {
    setWheelResult(result);
  };

  return (
    <div className="flex flex-col h-vh bg-gray-800 bg-opacity-90 p-8 rounded-lg">
      <CouponWheel ref={wheelRef} onFinish={handleSpinFinish} />
      <div className="flex flex-col self-center ">
        <button
          onClick={handleSpinClick}
          className="spin-button p-5 px-10 rounded-full bg-orange-500"
        >
          Spin
        </button>
        {wheelResult && (
          <div
            className="mt-6 text-2xl font-bold text-white "
            role="alert"
            aria-live="polite"
          >
            You won: {wheelResult}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
