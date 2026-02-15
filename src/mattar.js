 document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.querySelector("#wrapper-canvas");

            let dimensions = {
                width: window.innerWidth,
                height: window.innerHeight,
            };

            // কালার প্যালেট - ডার্ক এবং লাইট উভয় থিমেই মানানসই
            // এখানে কোনো কড়া লাল রঙ নেই। টিল, গোল্ড, পার্পল এবং স্লেট কালার ব্যবহার করা হয়েছে।
            const colorPalette = [
                '#88C0D0', // Ice Blue
                '#EBCB8B', // Soft Gold/Amber
                '#A3BE8C', // Soft Green
                '#B48EAD', // Muted Purple
                '#5E81AC', // Deep Blue
                '#D8DEE9'  // Soft White/Grey
            ];

            function getRandomColor() {
                return colorPalette[Math.floor(Math.random() * colorPalette.length)];
            }

            // Matter.js সেটআপ
            Matter.use('matter-attractors');

            function runMatter() {
                const { 
                    Engine, Events, Runner, Render, World, Body, Mouse, Common, Bodies 
                } = Matter;

                const engine = Engine.create();

                engine.world.gravity.y = 0;
                engine.world.gravity.x = 0;
                engine.world.gravity.scale = 0.1;

                const render = Render.create({
                    element: canvas,
                    engine: engine,
                    options: {
                        showVelocity: false,
                        width: dimensions.width,
                        height: dimensions.height,
                        wireframes: false,
                        background: "transparent", // ব্যাকগ্রাউন্ড CSS দ্বারা নিয়ন্ত্রিত হবে
                        pixelRatio: window.devicePixelRatio
                    },
                });

                const runner = Runner.create();
                const world = engine.world;
                world.gravity.scale = 0;

                // মাউস/আকর্ষণকারী বডি (Attractor Body)
                const attractiveBody = Bodies.circle(
                    render.options.width / 2,
                    render.options.height / 2,
                    Math.max(dimensions.width / 25, dimensions.height / 25) / 2,
                    {
                        render: {
                            fillStyle: `rgba(255, 255, 255, 0.1)`, // হালকা স্বচ্ছ সাদা
                            strokeStyle: `transparent`,
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

                // বিভিন্ন শেপ বা বডি তৈরি করা
                for (let i = 0; i < 60; i += 1) {
                    let x = Common.random(0, render.options.width);
                    let y = Common.random(0, render.options.height);
                    let s = Common.random() > 0.6 ? Common.random(10, 80) : Common.random(4, 60);
                    let polygonNumber = Common.random(3, 6); 

                    // মূল পলিগনগুলো (Rocks/Shapes)
                    const body = Bodies.polygon(
                        x, y, polygonNumber, s, 
                        {
                            mass: s / 20,
                            friction: 0,
                            frictionAir: 0.02,
                            angle: Math.round(Math.random() * 360),
                            render: {
                                fillStyle: getRandomColor(), // প্যালেট থেকে র‍্যান্ডম কালার
                                strokeStyle: '#2E3440', // আউটলাইন ডার্ক রাখা হলো কন্ট্রাস্টের জন্য
                                lineWidth: 2,
                            },
                        }
                    );
                    World.add(world, body);

                    // ছোট পার্টিকেলস
                    let r = Common.random(0, 1);
                    
                    // ছোট ভাসমান কণা
                    const circle = Bodies.circle(x, y, Common.random(2, 8), {
                        mass: 0.1,
                        friction: 0,
                        frictionAir: 0.01,
                        render: {
                            fillStyle: getRandomColor(),
                            strokeStyle: 'transparent',
                            lineWidth: 0,
                            opacity: 0.8
                        },
                    });
                    World.add(world, circle);
                }

                const mouse = Mouse.create(render.canvas);
                
                // মাউস হুইল ইভেন্ট বন্ধ করা (যাতে পেজ স্ক্রল না হয়)
                mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
                mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

                render.mouse = mouse;

                // মাউস মুভমেন্ট এর সাথে অ্যাট্রাক্টর বডি আপডেট করা
                Events.on(engine, "afterUpdate", function () {
                    if (!mouse.position.x) return;
                    Body.translate(attractiveBody, {
                        x: (mouse.position.x - attractiveBody.position.x) * 0.12,
                        y: (mouse.position.y - attractiveBody.position.y) * 0.12,
                    });
                });

                const data = {
                    engine: engine,
                    runner: runner,
                    render: render,
                    canvas: render.canvas,
                    stop: function () {
                        Matter.Render.stop(render);
                        Matter.Runner.stop(runner);
                    },
                };

                Matter.Runner.run(runner, engine);
                Matter.Render.run(render);
                return data;
            }

            // রিসাইজ হ্যান্ডলার (Debounce সহ)
            function debounce(func, wait, immediate) {
                let timeout;
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

            function setWindowSize() {
                if (typeof m === 'undefined') return; // m তৈরি না হলে রিটার্ন

                const width = window.innerWidth;
                const height = window.innerHeight;
                dimensions.width = width;
                dimensions.height = height;

                m.render.canvas.width = width;
                m.render.canvas.height = height;
                
                // বাউন্ডারি রিসাইজ করা জরুরি নয়তো অবজেক্ট হারিয়ে যেতে পারে
                // Matter.js এর রেন্ডারার রিসাইজ করা একটু ট্রিকি, তাই সাধারণ ক্যানভাস সাইজ আপডেটই যথেষ্ট
            }

            let m = runMatter();
            window.addEventListener('resize', debounce(setWindowSize, 250));
        });