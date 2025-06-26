


function oglw_prepare_for_contextloss(glws) 
{
    const canvas = glws.glws_canvas;

    canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        glws.glws_context_available = false;
        glws.glws_resources_available = false;
    }, false);

    canvas.addEventListener("webglcontextrestored", (event) => {
        glws.glws_context_available = true;
        oglw_request_frame(glws);
    }, false);
}

function oglw_add_resize_handler(glws) 
{
    let observer = new ResizeObserver((entries) =>{
        if (entries[0].devicePixelContentBoxSize) {
            glws.glws_width_dpx = entries[0].devicePixelContentBoxSize[0].inlineSize;
            glws.glws_height_dpx = entries[0].devicePixelContentBoxSize[0].blockSize;
        }
        else {
            const dpr = window.devicePixelRatio;
            glws.glws_width_dpx = dpr * entry.contentRect.width;
            glws.glws_height_dpx = dpr * entry.contentRect.height;
        }
        glws.glws_resized = true;
        oglw_request_frame(glws);
    });

    observer.observe(glws.glws_canvas);
}

/// Constructor function for an oglw_state
function oglw_state(canvas_element) 
{
    const glws = this;

    glws.glws_context_available = false; /// Status of the context. Set to false on context loss, set to true, when the context is restored.
    glws.glws_resources_available = false; /// Status of the resources (buffers, textures, etc.). Set to false on context loss, set to true, when they are re-created.
    glws.glws_canvas = canvas_element; /// The DOM canvas element

    glws.glws_width_dpx = 0; /// Width of the canvas / context in device pixels
    glws.glws_height_dpx = 0; /// Height of the canvas / context in device pixels
    glws.glws_resized = false; /// Flag whether the size of the canvas element has changed since the last redraw
    glws.glws_frame_requested = false;

    // Initialize the GL context
    const context = canvas_element.getContext("webgl2"); // WebGl2.0
    if (context === null) return glsw;

    glws.glws_context = context;
    glws.glws_context_available = true;

    oglw_prepare_for_contextloss(glws);

    oglw_add_resize_handler(glws);

    return glws;
}

function oglw_resize_context(glws) 
{
    const gl = glws.glws_context;

    gl.width = glws.glws_width_dpx;
    gl.height = glws.glws_height_dpx;

    glws.glws_resized = false;
}

function oglw_create_resources(glws) 
{
    const gl = glws.glws_context;


    glws.glws_resources_available = true;
}

function oglw_request_frame(glws) 
{
    if (glws.glws_frame_requested) return;
    glws.glws_frame_requested = true;
    window.requestAnimationFrame((timestamp) => {
        glws.glws_frame_requested = false;
        oglw_redraw(glws);
    });
}

function oglw_redraw(glws)
{
    if (!glws.glws_context_available) {
        return;
    }

    const gl = glws.glws_context;

    if (!glws.glws_resources_available) {
        oglw_create_resources(glws);
        if (!glws.glws_resources_available) return;
    }

    if (glws.glws_resized) {
        oglw_resize_context(glws);
    }

    // Set clear color to black, fully opaque
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);
}


function main()
{
    const canvas_element = document.getElementById("canvas1");
    const glws = new oglw_state(canvas_element);
}