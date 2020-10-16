import {useEffect, useLayoutEffect, useRef} from 'react';
import {dndzone as svelteDndZone, overrideItemIdKeyNameBeforeInitialisingDndZones as overrideIId} from "svelte-dnd-action";
import {createFlipper} from "./util/flip";

let ID_KEY = "id";
export function overrideItemIdKeyNameBeforeInitialisingDndZones(newId) {
  overrideIId(newId);
  ID_KEY = newId;
}

const DEFAULT_FLIP_DURATION_MS = 200;
/* TODO
* why is "action running" printed to the console twice on every operation?
*/
export function useDndZone(nodeRef, options, onConsider, onFinalize = onConsider) {
    const updateR = useRef(() => {});
    const flipper = useRef({});
    console.debug(`action running ${JSON.stringify(options, null, 2)}`);
    useEffect(function init() {
        if (!nodeRef.current) return;
        console.debug("init");
        //TODO - deal with flip duration better, should i default to zero?
        flipper.current = createFlipper(nodeRef.current, options.flipDurationMs !== undefined?  options.flipDurationMs : DEFAULT_FLIP_DURATION_MS);

        const {update, destroy} = svelteDndZone(nodeRef.current, {flipDurationMs: DEFAULT_FLIP_DURATION_MS, ...options});
        updateR.current = update;
        return destroy;
    }, [nodeRef]);
    useEffect(function addListeners() {
        if (!nodeRef.current) return;
        const node = nodeRef.current;
        console.debug("adding listeners", node);
        function adaptConsider(e) {
            if (flipper.current.read) {
                flipper.current.read(options.items.map(item => item[ID_KEY]));
            }
            onConsider(e.detail);
        }
        function adaptFinalize(e) {
            if (flipper.current.read) {
                flipper.current.read(options.items.map(item => item[ID_KEY]));
            }
            onFinalize(e.detail);
        }
        node.addEventListener('consider', adaptConsider);
        node.addEventListener('finalize', adaptFinalize);
        return () => {
            node.removeEventListener('consider', adaptConsider);
            node.removeEventListener('finalize', adaptFinalize);
        }
    }, [nodeRef, options, onConsider, onFinalize]);
    useLayoutEffect(function update() {
        if (!nodeRef.current) return;
        console.debug(`updating ${JSON.stringify(options)}`);
        updateR.current({flipDurationMs: DEFAULT_FLIP_DURATION_MS, ...options});
    });
    useLayoutEffect(function flip() {
        if (flipper.current.flip) {
            flipper.current.flip(options.items.map(item => item[ID_KEY]));
        }
    }, [options.items]);
}
