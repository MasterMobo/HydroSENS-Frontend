export const drawOptions = {
    polyline: false,
    polygon: {
        allowIntersection: false,
        drawError: {
            color: "#e1e100",
            message: "<strong>Oh snap!<strong> you can't draw that!",
        },
        shapeOptions: {
            color: "#97009c",
        },
    },
    rectangle: {
        shapeOptions: {
            //   clickable: false,
        },
    },
    circle: {
        shapeOptions: {
            color: "#662d91",
        },
    },
    marker: false,
    circlemarker: false,
};
