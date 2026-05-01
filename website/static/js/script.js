/* ===================================================================
   Tek Consulting – Main JavaScript
   All event listeners use guard clauses so the script runs safely
   on every page, not just the ones that contain specific elements.
   =================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ------------------------------------------------------------------
     0. Navbar — hamburger toggle
        Toggles [hidden] on #mobile-nav and flips aria-expanded.
        The CSS animates the three spans into an × when expanded.
  ------------------------------------------------------------------ */
  var navToggle = document.querySelector(".navbar__toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      if (expanded) {
        mobileNav.setAttribute("hidden", "");
      } else {
        mobileNav.removeAttribute("hidden");
      }
    });

    // Close mobile nav when a link inside it is clicked
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("hidden", "");
      });
    });
  }

  /* ------------------------------------------------------------------
     1. Portfolio – Load items from JSON
        portfolio.html sets window.PORTFOLIO_JSON_URL via a <script>
        block so url_for() generates the correct static file path.
  ------------------------------------------------------------------ */
  var portfolioContainer = document.getElementById("portfolio-items"); // fixed: was "porfolio-items"
  if (portfolioContainer) {
    var jsonUrl = (window.PORTFOLIO_JSON_URL) || "/static/data/portfolio.json";
    fetch(jsonUrl)
      .then(function (response) {
        if (!response.ok) { throw new Error("HTTP error " + response.status); }
        return response.json();
      })
      .then(function (data) {
        data.forEach(function (item) {
          var card = document.createElement("div");
          card.classList.add("portfolio-item");

          var title = document.createElement("h3");
          title.textContent = item.title;

          var desc = document.createElement("p");
          desc.textContent = item.description;

          card.appendChild(title);
          card.appendChild(desc);
          portfolioContainer.appendChild(card);
        });
      })
      .catch(function (err) {
        console.error("Could not load portfolio data:", err);
      });
  }

  /* ------------------------------------------------------------------
     2. Drag-and-Drop File Upload
        Present on: contact.html and client_dashboard.html
  ------------------------------------------------------------------ */
  var dropArea   = document.getElementById("drop-area");
  var fileInput  = document.getElementById("file");
  var fileSelect = document.getElementById("file-select");
  var fileList   = document.getElementById("file-list");

  if (dropArea && fileInput) {
    // Highlight border while dragging over
    dropArea.addEventListener("dragover", function (e) {
      e.preventDefault();
      dropArea.classList.add("highlight");
    });

    dropArea.addEventListener("dragleave", function () {
      dropArea.classList.remove("highlight");
    });

    // Accept dropped files
    dropArea.addEventListener("drop", function (e) {
      e.preventDefault();
      dropArea.classList.remove("highlight");
      renderFileList(e.dataTransfer.files);
    });

    // Open the hidden file input when "browse" is clicked
    if (fileSelect) {
      fileSelect.addEventListener("click", function () {
        fileInput.click();
      });
    }

    // Reflect files chosen via the dialog
    fileInput.addEventListener("change", function () {
      renderFileList(fileInput.files);
    });
  }

  function renderFileList(files) {
    if (!files || files.length === 0) { return; }
    if (fileList) {
      fileList.innerHTML = "";
      Array.from(files).forEach(function (f) {
        var li = document.createElement("li");
        li.textContent = f.name + "  (" + (f.size / 1024).toFixed(1) + " KB)";
        fileList.appendChild(li);
      });
    }
    console.log("Files selected:", files);
  }

  /* ------------------------------------------------------------------
     3. Contact Form – Client-side validation
        Only runs when a <form class="contact-form"> exists.
  ------------------------------------------------------------------ */
  var contactForm = document.querySelector("form.contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      var name    = document.getElementById("name");
      var email   = document.getElementById("email");
      var message = document.getElementById("message");

      var allFilled = (
        name    && name.value.trim()    !== "" &&
        email   && email.value.trim()   !== "" &&
        message && message.value.trim() !== ""
      );

      if (!allFilled) {
        e.preventDefault();
        alert("Please fill out all required fields before submitting.");
      }
    });
  }

  /* ------------------------------------------------------------------
     4. Typewriter Effect
        Only runs when <span id="typewriter"> exists (index.html hero).
  ------------------------------------------------------------------ */
  var typewriter = document.getElementById("typewriter");
  if (typewriter) {
    var phrases  = [
      "Empowering Businesses",
      "Creating Innovative Solutions",
      "Transforming Ideas Into Reality"
    ];
    var pIndex   = 0;
    var cIndex   = 0;
    var deleting = false;

    function type() {
      var current = phrases[pIndex];
      typewriter.textContent = current.substring(0, cIndex);

      if (!deleting && cIndex < current.length) {
        cIndex++;
        setTimeout(type, 100);
      } else if (deleting && cIndex > 0) {
        cIndex--;
        setTimeout(type, 50);
      } else {
        deleting = !deleting;
        if (!deleting) {
          pIndex = (pIndex + 1) % phrases.length;
        }
        setTimeout(type, 1500);
      }
    }

    type();
  }

  /* ------------------------------------------------------------------
     5. Testimonial Carousel (CSS-transform sliding version)
        Only runs when .testimonial-carousel contains more than one
        child to avoid meaningless single-item transforms.
  ------------------------------------------------------------------ */
  var carousel = document.querySelector(".testimonial-carousel");
  if (carousel && carousel.children.length > 1) {
    var slideIndex = 0;

    setInterval(function () {
      slideIndex = (slideIndex + 1) % carousel.children.length;
      carousel.style.transform = "translateX(-" + (slideIndex * 100) + "%)";
    }, 5000);
  }

  /* ------------------------------------------------------------------
     6. Intersection Observer – fade sections in on scroll
        Falls back to making all sections immediately visible if the
        browser doesn't support IntersectionObserver.
  ------------------------------------------------------------------ */
  var sections = document.querySelectorAll("section");

  if (sections.length > 0) {
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      sections.forEach(function (section) {
        observer.observe(section);
      });
    } else {
      // Graceful degradation
      sections.forEach(function (section) {
        section.classList.add("visible");
      });
    }
  }

});
