/* =============================================================
   FRY. — FULLSCREEN BRAND INTRO
   ============================================================= */

(function () {

  "use strict";

  /* -----------------------------------------------------------
     ELEMENTOS
     ----------------------------------------------------------- */

  const intro = document.getElementById("fryIntro");
  const introDot = document.querySelector("[data-intro-dot]");
  const introLine = document.querySelector("[data-intro-line]");

  const hero = document.querySelector(".hero");
  const logo = document.querySelector(".hero-title");
  const letters = document.querySelectorAll(
    ".hero-title .hero-logo-letter"
  );

  const tagline = document.querySelector("[data-intro-tagline]");
  const taglineWords = tagline
    ? tagline.querySelectorAll(".intro-word")
    : [];

  const eyebrow = document.querySelector(".hero-eyebrow");
  const actions = document.querySelector(".hero-actions");
  const meta = document.querySelector(".hero-meta");

  const navigation = document.querySelector("header, nav");


  /* -----------------------------------------------------------
     COMPROBACIONES
     ----------------------------------------------------------- */

  if (
    !intro ||
    !introDot ||
    !logo ||
    !letters.length
  ) {
    console.warn("FRY Intro: faltan elementos del hero.");
    return;
  }


  /* -----------------------------------------------------------
     BLOQUEAR SCROLL
     ----------------------------------------------------------- */

  document.body.classList.add("fry-intro-active");

  const previousOverflow = document.body.style.overflow;

  document.body.style.overflow = "hidden";


  /* -----------------------------------------------------------
     REDUCED MOTION
     ----------------------------------------------------------- */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  if (reducedMotion) {

    document.body.classList.remove(
      "fry-intro-active"
    );

    document.body.classList.add(
      "fry-intro-finished"
    );

    document.body.style.overflow =
      previousOverflow;

    return;
  }


  /* -----------------------------------------------------------
     ESPERAR A QUE LA FUENTE ORIGINAL ESTÉ CARGADA
     
     IMPORTANTE:
     No sustituimos Anton.
     Esperamos a que la tipografía actual termine de cargar
     antes de calcular posiciones.
     ----------------------------------------------------------- */

  function startIntro() {

    /*
      Esperamos un frame adicional.
      Así el navegador ya ha calculado correctamente
      las dimensiones del logo.
    */

    requestAnimationFrame(() => {

      requestAnimationFrame(() => {

        runAnimation();

      });

    });

  }


  if (document.fonts && document.fonts.ready) {

    document.fonts.ready.then(startIntro);

  } else {

    window.addEventListener(
      "load",
      startIntro,
      { once: true }
    );

  }


  /* -----------------------------------------------------------
     ANIMACIÓN
     ----------------------------------------------------------- */

  function runAnimation() {

    /*
      Usamos Web Animations API.
      No necesitamos modificar la tipografía.
    */


    /* ---------------------------------------------------------
       ESTADO INICIAL EXPLÍCITO

       IMPORTANTE:
       Antes dependíamos solo de que el body llevara la clase
       "fry-intro-active" para ocultar estos elementos. Eso
       hacía que TODO permaneciera invisible hasta el final,
       porque el padre (.hero-title, etc.) seguía en opacity:0
       durante toda la intro. Ahora fijamos el estado inicial
       directamente en cada elemento, para poder quitar la
       pantalla negra ANTES de que termine el reveal y así
       ver a F, R, Y (y el resto) aparecer de verdad en pantalla,
       no todo de golpe al final.
       --------------------------------------------------------- */

    letters.forEach((letter) => {
      letter.style.opacity = "0";
      letter.style.transform = "translate3d(0,28px,0)";
    });

    taglineWords.forEach((word) => {
      word.style.opacity = "0";
      word.style.transform = "translate3d(0,18px,0)";
    });

    if (navigation) {
      navigation.style.opacity = "0";
      navigation.style.transform = "translateY(-12px)";
    }
    if (eyebrow) {
      eyebrow.style.opacity = "0";
      eyebrow.style.transform = "translateY(15px)";
    }
    if (actions) {
      actions.style.opacity = "0";
      actions.style.transform = "translateY(18px)";
    }
    if (meta) {
      meta.style.opacity = "0";
      meta.style.transform = "translateY(12px)";
    }


    /* ---------------------------------------------------------
       POSICIÓN DEL PUNTO FINAL DEL LOGO

       Calculamos dónde está realmente el punto de "FRY." para
       que el punto de la intro encoja justo AHÍ (sin viajar
       por la pantalla, solo aparece en su sitio y se hace
       pequeño en el mismo punto).
       --------------------------------------------------------- */

    const dotRect =
      document.querySelector(
        ".hero-title .dot"
      )?.getBoundingClientRect();

    let targetX = 0;
    let targetY = 0;

    if (dotRect) {

      const targetCenterX =
        dotRect.left +
        dotRect.width / 2;

      const targetCenterY =
        dotRect.top +
        dotRect.height / 2;

      const screenCenterX =
        window.innerWidth / 2;

      const screenCenterY =
        window.innerHeight / 2;

      targetX =
        targetCenterX -
        screenCenterX;

      targetY =
        targetCenterY -
        screenCenterY;

    }


    /* ---------------------------------------------------------
       ANIMACIÓN DEL PUNTO — aparece ya en el sitio del punto
       final y solo encoge ahí, sin desplazarse.
       --------------------------------------------------------- */

    introDot.style.opacity = "1";

    introDot.animate(

      [
        {
          transform:
            "translate3d(0,0,0) scale(12)"
        },
        {
          transform:
            `translate3d(${targetX}px, ${targetY}px, 0) scale(1)`
        }
      ],

      {
        duration: 600,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
      }

    );


    /* ---------------------------------------------------------
       PEQUEÑA LÍNEA
       --------------------------------------------------------- */

    introLine.animate(

      [
        {
          width: "0px",
          opacity: 0
        },

        {
          width: "120px",
          opacity: 0.25,
          offset: 0.45
        },

        {
          width: "220px",
          opacity: 0
        }
      ],

      {
        duration: 850,
        delay: 250,
        easing:
          "cubic-bezier(.16,1,.3,1)",
        fill: "forwards"
      }

    );


    /* ---------------------------------------------------------
       LETRAS FRY
       
       IMPORTANTE:
       Animamos las letras EXISTENTES.
       No las recreamos.
       Por tanto conservan exactamente su fuente Anton.
       --------------------------------------------------------- */

    letters.forEach(
      (letter, index) => {

        letter.animate(

          [
            {
              opacity: 0,
              transform:
                "translate3d(0,28px,0)"
            },

            {
              opacity: 1,
              transform:
                "translate3d(0,0,0)"
            }
          ],

          {
            duration: 650,

            delay:
              700 +
              (index * 120),

            easing:
              "cubic-bezier(.16,1,.3,1)",

            fill: "forwards"
          }

        );

      }
    );


    /* ---------------------------------------------------------
       TAGLINE
       
       HOT.
       CRISPY.
       LOUD.
       --------------------------------------------------------- */

    taglineWords.forEach(
      (word, index) => {

        word.animate(

          [
            {
              opacity: 0,
              transform:
                "translate3d(0,18px,0)"
            },

            {
              opacity: 1,
              transform:
                "translate3d(0,0,0)"
            }
          ],

          {
            duration: 500,

            delay:
              1400 +
              (index * 140),

            easing:
              "cubic-bezier(.16,1,.3,1)",

            fill: "forwards"
          }

        );

      }
    );


    /* ---------------------------------------------------------
       ABRIR LA PANTALLA NEGRA

       Tras ~2,3s con el punto solo en pantalla, empieza a
       desvanecerse el overlay negro. Las letras (delay 2400+)
       y todo lo demás arrancan justo después, así que se ven
       aparecer de verdad, no de golpe al final.
       --------------------------------------------------------- */

    setTimeout(revealOverlay, 650);


    /* ---------------------------------------------------------
       REVELACIÓN DE LA WEB
       
       El hero ya está construido.
       Ahora aparecen los elementos alrededor.
       --------------------------------------------------------- */

    revealPage();


    /* ---------------------------------------------------------
       FINAL
       --------------------------------------------------------- */

    setTimeout(
      finishIntro,
      3000
    );

  }


  /* ===========================================================
     ABRIR EL OVERLAY (quita el negro, deja ver la página real)
     =========================================================== */

  function revealOverlay() {

    document.body.classList.remove(
      "fry-intro-active"
    );

    document.body.classList.add(
      "fry-intro-finished"
    );

  }


  /* ===========================================================
     REVELAR PÁGINA
     =========================================================== */

  function revealPage() {

    const revealOptions = {

      duration: 650,

      easing:
        "cubic-bezier(.16,1,.3,1)",

      fill: "forwards"

    };


    /* Navegación */

    if (navigation) {

      navigation.animate(

        [
          {
            opacity: 0,
            transform:
              "translateY(-12px)"
          },

          {
            opacity: 1,
            transform:
              "translateY(0)"
          }
        ],

        {
          ...revealOptions,
          delay: 1800
        }

      );

    }


    /* Eyebrow */

    if (eyebrow) {

      eyebrow.animate(

        [
          {
            opacity: 0,
            transform:
              "translateY(15px)"
          },

          {
            opacity: 1,
            transform:
              "translateY(0)"
          }
        ],

        {
          ...revealOptions,
          delay: 1950
        }

      );

    }


    /* Botones */

    if (actions) {

      actions.animate(

        [
          {
            opacity: 0,
            transform:
              "translateY(18px)"
          },

          {
            opacity: 1,
            transform:
              "translateY(0)"
          }
        ],

        {
          ...revealOptions,
          delay: 2100
        }

      );

    }


    /* Meta */

    if (meta) {

      meta.animate(

        [
          {
            opacity: 0,
            transform:
              "translateY(12px)"
          },

          {
            opacity: 1,
            transform:
              "translateY(0)"
          }
        ],

        {
          ...revealOptions,
          delay: 2250
        }

      );

    }

  }


  /* ===========================================================
     TERMINAR INTRO
     =========================================================== */

  function finishIntro() {

    /*
      Dejamos que el hero se vea completamente.
    */

    document.body.classList.remove(
      "fry-intro-active"
    );

    document.body.classList.add(
      "fry-intro-finished"
    );


    /*
      Desbloqueamos scroll.
    */

    document.body.style.overflow =
      previousOverflow;


    /*
      Avisamos al resto de la web de que la intro terminó,
      por si algún otro script necesita saberlo.
    */

    window.dispatchEvent(
      new Event("fry:intro-finished")
    );


    /*
      Quitamos la intro del flujo visual
      después de la transición.
    */

    setTimeout(() => {

      if (intro) {

        intro.style.display = "none";

      }

    }, 1000);

  }


})();
