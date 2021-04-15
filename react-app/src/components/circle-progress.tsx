const styles = {
    circle: {
        transition: '0.35s stroke-dashoffset',
        transform: 'rotate(-90deg)',
        'transform-origin': '50% 50%',
    },
}
export const CircleProgress = ({ percent = 100 }) => {
    const radius = 60;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circle = normalizedRadius * 2 * Math.PI;
    const offset = circle - (percent / 100 * circle);

    return (
        <div className="relative flex justify-center items-center text-blue-500 text-xl font-bold w-32 h-32">
            <svg className="absolute" height="120" width="120">
                <circle
                    stroke="#eee"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    style={styles.circle}
                />
                <circle
                    stroke={'blue'}
                    strokeWidth={stroke}
                    strokeDasharray={`${circle} ${circle}`}
                    strokeDashoffset={offset}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    style={styles.circle}
                />
            </svg>
            <div>{percent}%</div>
        </div>

    )
};
