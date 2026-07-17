export function ExistingRingVisual() {
  return (
    <svg
      viewBox="0 0 720 560"
      role="img"
      aria-labelledby="existing-ring-title existing-ring-desc"
      className="h-full w-full"
    >
      <title id="existing-ring-title">מדידת הקוטר הפנימי של טבעת קיימת</title>
      <desc id="existing-ring-desc">טבעת מונחת מעל סרגל וקו מסמן את הקוטר הפנימי מקצה לקצה</desc>
      <rect width="720" height="560" fill="#f5f2ec" />

      <g transform="translate(0 2)">
        <circle cx="360" cy="248" r="132" fill="none" stroke="#aa8e59" strokeWidth="18" />
        <circle cx="360" cy="248" r="121" fill="none" stroke="#e5d7bc" strokeWidth="2" opacity="0.9" />
        <path d="M316 119 340 84h40l24 35-44 38z" fill="#fbfcfb" stroke="#aeb3b1" strokeWidth="2" />
        <path d="m340 84 20 73 20-73M316 119h88M340 84l-24 35 44 38 44-38-24-35" fill="none" stroke="#c4c9c7" strokeWidth="1.5" />
        <path d="M309 137c13-17 28-26 51-27 23 1 38 10 51 27" fill="none" stroke="#aa8e59" strokeWidth="10" strokeLinecap="round" />
      </g>

      <g stroke="#121313" strokeWidth="2">
        <path d="M238 266h244" />
        <path d="m238 266 13-7v14zM482 266l-13-7v14z" fill="#121313" stroke="none" />
      </g>
      <text x="360" y="300" textAnchor="middle" fill="#2c2e2d" fontFamily="var(--font-body)" fontSize="20">
        קוטר פנימי בלבד
      </text>

      <g transform="translate(100 428)">
        <rect width="520" height="46" fill="#ffffff" stroke="#c9cbc8" />
        {Array.from({ length: 27 }, (_, index) => (
          <line
            key={index}
            x1={index * 20}
            x2={index * 20}
            y1="0"
            y2={index % 5 === 0 ? 23 : index % 2 === 0 ? 15 : 10}
            stroke={index === 13 ? "#756343" : "#686b69"}
            strokeWidth={index === 13 ? 2 : 1}
          />
        ))}
        <text x="10" y="37" fill="#686b69" fontFamily="var(--font-body)" fontSize="13">מ״מ</text>
      </g>
    </svg>
  );
}

export function FingerCircumferenceVisual() {
  return (
    <svg
      viewBox="0 0 720 560"
      role="img"
      aria-labelledby="finger-title finger-desc"
      className="h-full w-full"
    >
      <title id="finger-title">מדידת היקף האצבע באמצעות פס נייר</title>
      <desc id="finger-desc">פס נייר דק מקיף אצבע ומסומן בנקודת החפיפה לפני מדידה בסרגל</desc>
      <rect width="720" height="560" fill="#eef0ed" />

      <path
        d="M292 510c-14-79-20-170-18-274 2-99 38-151 86-151s84 52 86 151c2 104-4 195-18 274z"
        fill="#eee2d3"
        stroke="#cdbca9"
        strokeWidth="2"
      />
      <path d="M302 151c18-24 37-36 58-36s40 12 58 36" fill="none" stroke="#d8c7b5" strokeWidth="2" />

      <g transform="translate(0 5)">
        <path d="M220 318c76-18 204-18 280 0v64c-76 18-204 18-280 0z" fill="#ffffff" stroke="#a88f60" strokeWidth="2" />
        <path d="M444 311v78" stroke="#121313" strokeWidth="3" />
        <circle cx="444" cy="350" r="6" fill="#a88f60" />
        <path d="M470 273 446 313" stroke="#756343" strokeWidth="1.5" />
        <text x="478" y="265" fill="#2c2e2d" fontFamily="var(--font-body)" fontSize="18">סמנו כאן</text>
      </g>

      <g transform="translate(104 459)">
        <rect width="512" height="42" fill="#ffffff" stroke="#c9cbc8" />
        {Array.from({ length: 33 }, (_, index) => (
          <line
            key={index}
            x1={index * 16}
            x2={index * 16}
            y1="0"
            y2={index % 5 === 0 ? 22 : index % 2 === 0 ? 14 : 9}
            stroke="#686b69"
            strokeWidth="1"
          />
        ))}
        <text x="10" y="34" fill="#686b69" fontFamily="var(--font-body)" fontSize="13">מ״מ</text>
      </g>
    </svg>
  );
}
