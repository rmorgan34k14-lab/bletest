(function () {
  "use strict";

  const toast = document.getElementById("toast");
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  // 1. Share button (copies current URL or shows fallback toast)
  const shareBtn = document.getElementById("shareProfileBtn");
  shareBtn.addEventListener("click", async () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Profile link copied to clipboard");
        return;
      } catch (_) {}
    }
    showToast("Share link ready: " + shareUrl);
  });

  // 2. Placeholder outbound links behave sensibly until replaced with real URLs
  document.querySelectorAll("[data-placeholder-link]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const label = el.getAttribute("data-placeholder-link");
      showToast("Placeholder destination: " + label);
    });
  });

  // 3. Email / Phone tab toggle & form submission
  const tabs = document.querySelectorAll(".tab-btn");
  const contactInput = document.getElementById("contactInput");
  const subscribeForm = document.getElementById("subscribeForm");
  const formStatus = document.getElementById("formStatus");
  let activeMode = "email";

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      activeMode = tab.dataset.mode;
      formStatus.textContent = "";

      if (activeMode === "email") {
        contactInput.type = "email";
        contactInput.placeholder = "Enter your email address";
      } else {
        contactInput.type = "tel";
        contactInput.placeholder = "Enter your mobile number (+1 555-0199)";
      }
      contactInput.value = "";
      contactInput.focus();
    });
  });

  subscribeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = contactInput.value.trim();
    if (!val) {
      formStatus.style.color = "#b42318";
      formStatus.textContent =
        activeMode === "email"
          ? "Please enter a valid email address."
          : "Please enter a valid phone number.";
      contactInput.focus();
      return;
    }
    formStatus.style.color = "#1b6b3a";
    formStatus.textContent =
      activeMode === "email"
        ? "Subscribed! Updates will be sent to " + val + "."
        : "Subscribed! SMS alerts enabled for " + val + ".";
    contactInput.value = "";
  });

  // 4. Video Trailer & Watch Cards Modal
  const dialog = document.getElementById("previewDialog");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  function openModal(title, htmlContent) {
    modalTitle.textContent = title;
    modalBody.innerHTML = htmlContent;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      showToast(title);
    }
  }

  modalCloseBtn.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  document.querySelectorAll("[data-video-title]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.getAttribute("data-video-title");
      openModal(
        "Video Preview",
        `<div class="modal-preview-box">
          <strong>${title}</strong>
          <span style="font-size:0.84rem;color:#cccccc;">Placeholder player — embed your YouTube, Vimeo, or MP4 source here.</span>
        </div>`
      );
    });
  });

  // 5. Listen Episode Rows & Mini Audio Dock
  const audioDock = document.getElementById("audioDock");
  const dockTitle = document.getElementById("dockTitle");
  const dockToggleBtn = document.getElementById("dockToggleBtn");
  const dockCloseBtn = document.getElementById("dockCloseBtn");
  const playButtons = document.querySelectorAll("[data-play-track]");
  let currentBtn = null;
  let isPlaying = false;

  function resetAudioRows() {
    document.querySelectorAll(".listen-row").forEach((r) => r.classList.remove("is-playing"));
    playButtons.forEach((b) => {
      b.textContent = "Play";
      b.setAttribute("aria-pressed", "false");
    });
  }

  playButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const trackName = btn.getAttribute("data-play-track");
      const row = btn.closest(".listen-row");

      if (currentBtn === btn && isPlaying) {
        isPlaying = false;
        btn.textContent = "Play";
        btn.setAttribute("aria-pressed", "false");
        dockToggleBtn.textContent = "Resume";
        return;
      }

      resetAudioRows();
      currentBtn = btn;
      isPlaying = true;
      row.classList.add("is-playing");
      btn.textContent = "Playing";
      btn.setAttribute("aria-pressed", "true");
      dockTitle.textContent = trackName;
      dockToggleBtn.textContent = "Pause";
      audioDock.classList.add("is-visible");
    });
  });

  dockToggleBtn.addEventListener("click", () => {
    if (!currentBtn) return;
    isPlaying = !isPlaying;
    dockToggleBtn.textContent = isPlaying ? "Pause" : "Resume";
    currentBtn.textContent = isPlaying ? "Playing" : "Play";
    currentBtn.setAttribute("aria-pressed", String(isPlaying));
  });

  dockCloseBtn.addEventListener("click", () => {
    isPlaying = false;
    currentBtn = null;
    resetAudioRows();
    audioDock.classList.remove("is-visible");
  });

  // 6. Footer Privacy Modals
  document.getElementById("privacyPolicyBtn").addEventListener("click", () => {
    openModal(
      "Privacy Policy",
      `<p class="modal-text">
        This is a placeholder privacy notice for your custom site. Replace this text with your official data handling, analytics, and newsletter disclosures before publishing.
      </p>`
    );
  });

  document.getElementById("privacyPrefsBtn").addEventListener("click", () => {
    openModal(
      "Privacy Preferences",
      `<div class="modal-prefs-list">
        <label class="modal-pref-row">
          <span>Essential Site Storage</span>
          <input type="checkbox" checked disabled />
        </label>
        <label class="modal-pref-row">
          <span>Audience Analytics</span>
          <input type="checkbox" checked />
        </label>
        <button type="button" class="btn-primary" id="savePrefsBtn">
          Save Preferences
        </button>
      </div>`
    );
    document.getElementById("savePrefsBtn").addEventListener("click", () => dialog.close());
  });

  // 7. Hero Image Auto-Slideshow
  const slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1) {
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove("is-active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("is-active");
    }, 4000); // Changes every 4 seconds
  }
})();

