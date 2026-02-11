 // Use const for elements that don't change
        const canvas = document.querySelector("#wrapper-canvas");

        // Use let for values that might be reassigned (though dimensions isn't strictly reassigned here, its props are)
        let dimensions = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        // Register plugins
        Matter.use("matter-attractors");
        Matter.use("matter-wrap");

        function runMatter() {
            // Destructure constants from Matter
            const { 
                Engine, Events, Runner, Render, World, Body, Mouse, Common, Bodies 
            } = Matter;

            // Create engine
            const engine = Engine.create();

            engine.world.gravity.y = 0;
            engine.world.gravity.x = 0;
            engine.world.gravity.scale = 0.1;

            // Create renderer
            const render = Render.create({
                element: canvas,
                engine: engine,
                options: {
                    showVelocity: false,
                    width: dimensions.width,
                    height: dimensions.height,
                    wireframes: false,
                    background: "transparent",
                },
            });

            // Create runner
            const runner = Runner.create();

            // Create demo scene
            const world = engine.world;
            world.gravity.scale = 0;

            // Create the attractor body
            const attractiveBody = Bodies.circle(
                render.options.width / 2,
                render.options.height / 2,
                Math.max(dimensions.width / 25, dimensions.height / 25) / 2,
                {
                    render: {
                        fillStyle: `#000`,
                        strokeStyle: `#000`,
                        lineWidth: 0,
                    },
                    isStatic: true,
                    plugin: {
                        attractors: [
                            function (bodyA, bodyB) {
                                return {
                                    x: (bodyA.position.x - bodyB.position.x) * 1e-6,
                                    y: (bodyA.position.y - bodyB.position.y) * 1e-6,
                                };
                            },
                        ],
                    },
                }
            );

            World.add(world, attractiveBody);

            // Add bodies to be attracted
            for (let i = 0; i < 60; i += 1) {
                let x = Common.random(0, render.options.width);
                let y = Common.random(0, render.options.height);
                let s = Common.random() > 0.6 ? Common.random(10, 80) : Common.random(4, 60);
                let polygonNumber = Common.random(3, 6);

                // Main polygon
                const body = Bodies.polygon(
                    x, y, polygonNumber, s,
                    {
                        mass: s / 20,
                        friction: 0,
                        frictionAir: 0.02,
                        angle: Math.round(Math.random() * 360),
                        render: {
                            fillStyle: "#222222",
                            strokeStyle: `#000000`,
                            lineWidth: 2,
                        },
                    }
                );
                World.add(world, body);

                let r = Common.random(0, 1);

                // Circle A (formerly first var circle)
                const circleA = Bodies.circle(x, y, Common.random(2, 8), {
                    mass: 0.1,
                    friction: 0,
                    frictionAir: 0.01,
                    render: {
                        fillStyle: r > 0.3 ? `#27292d` : `#444444`,
                        strokeStyle: `#000000`,
                        lineWidth: 2,
                    },
                });
                World.add(world, circleA);

                // Circle B (formerly second var circle)
                const circleB = Bodies.circle(x, y, Common.random(2, 20), {
                    mass: 6,
                    friction: 0,
                    frictionAir: 0,
                    render: {
                        fillStyle: r > 0.3 ? `#334443` : `#222222`,
                        strokeStyle: `#111111`,
                        lineWidth: 4,
                    },
                });
                World.add(world, circleB);

                // Circle C (formerly third var circle)
                const circleC = Bodies.circle(x, y, Common.random(2, 30), {
                    mass: 0.2,
                    friction: 0.6,
                    frictionAir: 0.8,
                    render: {
                        fillStyle: `#191919`,
                        strokeStyle: `#111111`,
                        lineWidth: 3,
                    },
                });
                World.add(world, circleC);
            }

            // Add mouse control
            const mouse = Mouse.create(render.canvas);

            Events.on(engine, "afterUpdate", function () {
                if (!mouse.position.x) return;
                // Smoothly move the attractor body towards the mouse
                Body.translate(attractiveBody, {
                    x: (mouse.position.x - attractiveBody.position.x) * 0.12,
                    y: (mouse.position.y - attractiveBody.position.y) * 0.12,
                });
            });

            // Return context
            const data = {
                engine: engine,
                runner: runner,
                render: render,
                canvas: render.canvas,
                stop: function () {
                    Matter.Render.stop(render);
                    Matter.Runner.stop(runner);
                },
                play: function () {
                    Matter.Runner.run(runner, engine);
                    Matter.Render.run(render);
                },
            };

            Matter.Runner.run(runner, engine);
            Matter.Render.run(render);
            return data;
        }

        // Debounce helper
        function debounce(func, wait, immediate) {
            let timeout; // must be let because it is reassigned
            return function () {
                const context = this;
                const args = arguments;
                
                const later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };

                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }

        // Window resize handler
        function setWindowSize() {
            // Note: In your original code 'dimensions' here was a local variable,
            // masking the global one. This is cleaner:
            const width = $(window).width();
            const height = $(window).height();

            // Update the global dimensions object if needed, or just use values directly
            dimensions.width = width;
            dimensions.height = height;

            m.render.canvas.width = width;
            m.render.canvas.height = height;
        }

        const m = runMatter();
        setWindowSize();
        $(window).resize(debounce(setWindowSize, 250));