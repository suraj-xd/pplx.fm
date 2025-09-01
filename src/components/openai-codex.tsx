// "use client";

// import { useEffect } from "react";

// export const Component = () => {
//   useEffect(() => {
//     if (!window.UnicornStudio) {
//       window.UnicornStudio = { isInitialized: false };
//       const script = document.createElement("script");
//       script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
//       script.onload = function() {
//         if (!window.UnicornStudio.isInitialized) {
//           UnicornStudio.init();
//           window.UnicornStudio.isInitialized = true;
//         }
//       };
//       (document.head || document.body).appendChild(script);
//     }
//   }, []);

//   return (
//     <div className={"flex flex-col items-center"}>
//       <div 
//         data-us-project="pG8BakZxbizFz2Jz2f4O" 
//         style={{ width: "100vw", height: "100vh", }}
//       />
//       <iframe
//         src="https://www.youtube.com/embed/ENSD0fGGm60?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=ENSD0fGGm60"
//         allow="autoplay; encrypted-media"
//         style={{
//           position: 'absolute',
//           top: '-9999px',
//           left: '-9999px',
//           width: '1px',
//           height: '1px',
//           opacity: 0,
//           pointerEvents: 'none'
//         }}
//       />
//     </div>
//   );
// };
