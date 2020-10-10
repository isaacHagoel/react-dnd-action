export function createFlipper(node, durationMS) {
    let idToRect = new Map();
    let idToAnim = new Map();
    console.debug({node});
    function read(ids) {
        console.debug(`read got ${JSON.stringify(ids)}`);
        Array.from(idToAnim.values()).forEach(anim => anim.cancel());
        idToRect = new Map();
        Array.from(node.children).forEach((child, index) => {
            idToRect.set(ids[index], child.getBoundingClientRect());
        });
        // console.debug(`reading ${JSON.stringify(idToRect, (key, value) => (value instanceof Map ? [...value] : value))}`);
    }
    function flip(ids) {
        console.debug(`flip got ${JSON.stringify(ids)}`);
        Array.from(node.children).forEach((child, index) => {
            const id = ids[index];
            const currentRect = child.getBoundingClientRect();
            const prevRect = idToRect.get(id);
            if (prevRect) {
               const transformX = prevRect.left - currentRect.left;
               const transformY = prevRect.top - currentRect.top;
               if (transformX || transformY) {
                   // console.debug({id, transformX, transformY});
                   const keyFrames = [
                       { transform: `translate3d(${transformX}px, ${transformY}px, 0)`},
                       { transform: 'translate3d(0, 0, 0)'}
                   ];
                   // console.debug(`animating ${id}`);
                   const animationObj = child.animate(keyFrames, {duration: durationMS, easing: "ease-out"});
                   idToAnim.set(id , animationObj);
                   animationObj.onfinish = () => {idToAnim.delete(id); console.debug(`animation finished ${id}`)};
                   animationObj.oncancel = () => {idToAnim.delete(id); console.debug(`animation cancelled ${id}`)};
               }
           }
        });
    }
    return {read, flip};
}
