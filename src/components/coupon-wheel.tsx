import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

type WheelItem = {
  label: string;
  color: string;
};

const WHEEL_ITEMS: WheelItem[] = [
  { label: "15% off", color: "#002c3c" },
  { label: "10% Off", color: "#f59e0b" },
  { label: "Free Shipping", color: "#005f80" },
  { label: "5% off", color: "#c2410c" },
  { label: "25% off", color: "#002c3c" },
  { label: "Free Shipping", color: "#f59e0b" },
  { label: "5% Off", color: "#005f80" },
  { label: "20% Off", color: "#c2410c" },
];

const WHEEL_RADIUS = 180;
const OUTER_CIRCLE_RADIUS = 196;
const BORDER_WIDTH = 16;
const NUMBER_OF_LIGHTS = 40;
const CENTER_POINT = 200;

type WheelState = {
  rotation: number;
  isSpinning: boolean;
  result: string | null;
};

type IndicatorPosition = "12" | "3" | "6" | "9";

type CouponWheelProps = {
  predeterminedWinner?: string;
  spinDuration?: number;
  spinDelay?: number;
  indicatorPosition?: IndicatorPosition;
  onFinish?: (result: string) => void; // Optional callback when spin finishes
};

// Define the type of the ref object that will be exposed
export interface CouponWheelRef {
  spinWheel: () => void;
}

export const CouponWheel = forwardRef<CouponWheelRef, CouponWheelProps>(
  (
    {
      predeterminedWinner,
      spinDuration = 4000,
      spinDelay = 200,
      indicatorPosition = "12",
      onFinish,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [wheelState, setWheelState] = useState<WheelState>({
      rotation: 0,
      isSpinning: false,
      result: null,
    });
    const [lightOn, setLightOn] = useState<boolean>(true);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const spinAnimationRef = useRef<number | null>(null);
    // Expose the spinWheel method to the parent component

    useEffect(() => {
      return () => {
        if (spinAnimationRef.current) {
          cancelAnimationFrame(spinAnimationRef.current);
          spinAnimationRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      if (!isOpen) {
        resetWheel();
      }
    }, [isOpen]);

    useEffect(() => {
      const interval = setInterval(() => {
        setLightOn((prev) => !prev);
      }, 500);
      return () => clearInterval(interval);
    }, []);

    const resetWheel = (): void => {
      setWheelState({
        rotation: 0,
        isSpinning: false,
        result: null,
      });
    };

    const spinWheel = (): void => {
      if (wheelState.isSpinning) return;

      setWheelState((prevState) => ({
        ...prevState,
        isSpinning: true,
        result: null,
      }));

      const segmentAngle = 360 / WHEEL_ITEMS.length;
      let totalRotation: number;

      if (predeterminedWinner) {
        const winnerIndex = WHEEL_ITEMS.findIndex(
          (item) => item.label === predeterminedWinner
        );
        if (winnerIndex === -1) {
          console.error("Predetermined winner not found in wheel items");
          setWheelState((prevState) => ({ ...prevState, isSpinning: false }));
          return;
        }

        // Calculate the angle to the center of the winning segment
        const targetAngle = winnerIndex * segmentAngle + segmentAngle / 2;

        // Adjust for indicator position
        const indicatorOffset = getIndicatorOffset();

        // Corrected total rotation calculation
        const rotations = 5; // Number of full rotations
        totalRotation =
          rotations * 360 + ((360 - targetAngle + indicatorOffset) % 360);

        // Add a small random offset
        const randomOffset =
          Math.random() * (segmentAngle / 2) - segmentAngle / 4;
        totalRotation += randomOffset;
      } else {
        // Randomly select a winning segment
        const randomIndex = Math.floor(Math.random() * WHEEL_ITEMS.length);
        const targetAngle = randomIndex * segmentAngle + segmentAngle / 2;

        const indicatorOffset = getIndicatorOffset();

        // Corrected total rotation calculation
        const rotations = 5; // Number of full rotations
        totalRotation =
          rotations * 360 + ((360 - targetAngle + indicatorOffset) % 360);

        // Add randomness
        const randomOffset =
          Math.random() * (segmentAngle / 2) - segmentAngle / 4;
        totalRotation += randomOffset;
      }
      setTimeout(() => {
        let startTime: number | undefined;
        const animate = (currentTime: number): void => {
          if (!startTime) startTime = currentTime;
          const elapsedTime = currentTime - startTime;

          if (elapsedTime < spinDuration) {
            const rotation = calculateRotation(
              elapsedTime,
              totalRotation,
              spinDuration
            );
            setWheelState((prevState) => ({ ...prevState, rotation }));
            spinAnimationRef.current = requestAnimationFrame(animate);
          } else {
            finishSpin(totalRotation);
            spinAnimationRef.current = null;
          }
        };

        spinAnimationRef.current = requestAnimationFrame(animate);
      }, spinDelay);
    };

    useImperativeHandle(ref, () => ({
      spinWheel,
    }));

    const getIndicatorOffset = (): number => {
      switch (indicatorPosition) {
        case "12":
          return 0;
        case "3":
          return 90;
        case "6":
          return 180;
        case "9":
          return 270;
        default:
          return 0;
      }
    };

    const calculateRotation = (
      elapsedTime: number,
      totalRotation: number,
      duration: number
    ): number => {
      const progress = elapsedTime / duration;
      const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out function
      return totalRotation * easeOutProgress;
    };

    const finishSpin = (totalRotation: number): void => {
      const winningIndex = determineWinningIndex(totalRotation);
      const result = WHEEL_ITEMS[winningIndex]?.label ?? "";

      setWheelState({
        rotation: totalRotation,
        isSpinning: false,
        result,
      });
      // Call the onFinish callback if provided
      if (onFinish) {
        onFinish(result);
      }
    };

    const determineWinningIndex = (totalRotation: number): number => {
      const segmentAngle = 360 / WHEEL_ITEMS.length;
      const normalizedRotation = ((totalRotation % 360) + 360) % 360; // Ensure positive angle

      const pointerAngle =
        (normalizedRotation - getIndicatorOffset() + 360) % 360;
      const winningIndex =
        Math.floor((360 - pointerAngle) / segmentAngle) % WHEEL_ITEMS.length;
      return winningIndex;
    };
    // Create wheel segment with labels aligned along the arc
    const createWheelSegment = (
      item: WheelItem,
      index: number
    ): JSX.Element => {
      const startAngle = index * (360 / WHEEL_ITEMS.length);
      const endAngle = (index + 1) * (360 / WHEEL_ITEMS.length);
      const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

      // Define the path ID for the arc
      const arcPathId = `arcPath-${index}`;

      // Create the outer arc path for the text
      const arcRadius = WHEEL_RADIUS - 20; // Adjust as needed
      const arcStart = polarToCartesian(arcRadius, endAngle);
      const arcEnd = polarToCartesian(arcRadius, startAngle);

      const arcD = [
        "M",
        arcStart.x,
        arcStart.y,
        "A",
        arcRadius,
        arcRadius,
        0,
        largeArcFlag,
        0,
        arcEnd.x,
        arcEnd.y,
      ].join(" ");

      return (
        <g key={index}>
          {createPieSlice(startAngle, endAngle, item.color, index)}
          <path id={arcPathId} d={arcD} fill="none" />
          {createSegmentLabel(arcPathId, item.label)}
        </g>
      );
    };

    const createPieSlice = (
      startAngle: number,
      endAngle: number,
      color: string,
      index: number
    ): JSX.Element => {
      const start = polarToCartesian(WHEEL_RADIUS, endAngle);
      const end = polarToCartesian(WHEEL_RADIUS, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

      const d = [
        "M",
        CENTER_POINT,
        CENTER_POINT,
        "L",
        start.x,
        start.y,
        "A",
        WHEEL_RADIUS,
        WHEEL_RADIUS,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
        "Z",
      ].join(" ");

      return <path id={`segment-${index}`} d={d} fill={color} />;
    };

    const createSegmentLabel = (
      arcPathId: string,
      label: string
    ): JSX.Element => {
      return (
        <text
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          <textPath
            href={`#${arcPathId}`}
            startOffset="50%"
            method="align"
            spacing="auto"
          >
            {label}
          </textPath>
        </text>
      );
    };

    const polarToCartesian = (
      radius: number,
      angle: number
    ): { x: number; y: number } => {
      const angleInRadians = ((angle - 90) * Math.PI) / 180;
      return {
        x: CENTER_POINT + radius * Math.cos(angleInRadians),
        y: CENTER_POINT + radius * Math.sin(angleInRadians),
      };
    };

    const createBorderLights = (): JSX.Element[] => {
      const lights: JSX.Element[] = [];
      for (let i = 0; i < NUMBER_OF_LIGHTS; i++) {
        const angle = (i / NUMBER_OF_LIGHTS) * 360;
        const { x, y } = polarToCartesian(OUTER_CIRCLE_RADIUS, angle);
        lights.push(
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill={lightOn ? "#FFD700" : "#4A4A4A"}
            stroke="#B8860B"
            strokeWidth="1"
          />
        );
      }
      return lights;
    };

    const renderIndicator = (): JSX.Element => {
      const indicatorSize = 20;
      const indicatorOffset = getIndicatorOffset();
      const angleInRadians = ((indicatorOffset - 90) * Math.PI) / 180;
      const x =
        CENTER_POINT +
        (WHEEL_RADIUS + indicatorSize / 2 + 10) * Math.cos(angleInRadians);
      const y =
        CENTER_POINT +
        (WHEEL_RADIUS + indicatorSize / 2 + 10) * Math.sin(angleInRadians);

      // Adjust rotation angle so the indicator points toward the center
      const rotationAngle = indicatorOffset + 180;

      return (
        <g transform={`translate(${x},${y}) rotate(${rotationAngle})`}>
          <polygon
            points={`0,${-indicatorSize / 2} ${-indicatorSize / 2},${
              indicatorSize / 2
            } ${indicatorSize / 2},${indicatorSize / 2}`}
            fill="white"
            stroke="black"
            strokeWidth="1"
          />
        </g>
      );
    };

    return (
      <div className="coupon-wheel-container">
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-3xl font-bold mb-8 text-white">Spin to Win!</h2>
          <div className="relative w-[400px] h-[400px]">
            {" "}
            {/* Adjusted height */}
            <svg
              ref={svgRef}
              viewBox="-20 -20 440 440"
              className="w-full h-full"
            >
              <circle
                cx={CENTER_POINT}
                cy={CENTER_POINT}
                r={OUTER_CIRCLE_RADIUS}
                fill="white"
                stroke="#DDD"
                strokeWidth={BORDER_WIDTH}
              />
              <g
                style={{
                  transform: `rotate(${wheelState.rotation}deg)`,
                  transformOrigin: `${CENTER_POINT}px ${CENTER_POINT}px`,
                  transition: "none",
                }}
              >
                {WHEEL_ITEMS.map(createWheelSegment)}
              </g>
              {createBorderLights()}
              {renderIndicator()}
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
              <p className="text-lg font-bold">Spin & Win</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default CouponWheel;
