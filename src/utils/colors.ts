export const generateRandomColor = () => {
    const colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#98D8C8",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};
