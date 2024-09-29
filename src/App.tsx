import React, { useRef } from "react";
import CouponWheel, { CouponWheelRef } from "./components/coupon-wheel";
type WheelItem = {
    label: string;
    color: string;
  };
  
const WHEEL_ITEMS: WheelItem[] = [
    { label: "15% Off", color: "#1E3A8A" }, // Indigo-800
    { label: "10% Off", color: "#2563EB" }, // Blue-600
    { label: "Free Shipping", color: "#3B82F6" }, // Blue-500
    { label: "5% Off", color: "#60A5FA" }, // Blue-400
    { label: "25% Off", color: "#93C5FD" }, // Blue-300
    { label: "Free Gift", color: "#BFDBFE" }, // Blue-200
    { label: "5% Off", color: "#DBEAFE" }, // Blue-100
    { label: "20% Off", color: "#0F52BA" }, // Blue-50
  ];

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
      <CouponWheel ref={wheelRef} onFinish={handleSpinFinish} wheelItems={WHEEL_ITEMS} />
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
