// Wait for the entire HTML document to be loaded
document.addEventListener("DOMContentLoaded", function () {
  // -- NAVBAR LOGIC --
  const mainNav = document.getElementById("mainNav");
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuIcon = document.getElementById("mobileMenuIcon");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  // Add background on scroll
  if (mainNav) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        mainNav.classList.add("bg-white/95", "backdrop-blur-md", "shadow-lg");
        mainNav.classList.remove("bg-transparent");
      } else {
        mainNav.classList.remove(
          "bg-white/95",
          "backdrop-blur-md",
          "shadow-lg"
        );
        mainNav.classList.add("bg-transparent");
      }
    });
  }

  // Mobile menu toggle
  let isMobileMenuOpen = false;

  if (mobileMenuToggle && mobileMenu && mobileMenuIcon) {
    mobileMenuToggle.addEventListener("click", function () {
      isMobileMenuOpen = !isMobileMenuOpen;

      if (isMobileMenuOpen) {
        mobileMenu.classList.add("active");
        mobileMenuIcon.classList.remove("fa-bars");
        mobileMenuIcon.classList.add("fa-times");
      } else {
        mobileMenu.classList.remove("active");
        mobileMenuIcon.classList.remove("fa-times");
        mobileMenuIcon.classList.add("fa-bars");
      }
    });
  }

  // Close mobile menu when clicking on nav links
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", function () {
      isMobileMenuOpen = false;
      mobileMenu.classList.remove("active");
      mobileMenuIcon.classList.remove("fa-times");
      mobileMenuIcon.classList.add("fa-bars");
    });
  });

  // -- INITIALIZE LIBRARIES --

  // Initialize AOS (Animate on Scroll)
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true,
      offset: 120,
    });
  }

  // Initialize Use Cases Swiper
  if (typeof Swiper !== "undefined") {
    const useCaseSwiper = new Swiper(".use-case-swiper", {
      autoHeight: true,
      spaceBetween: 20,
      navigation: {
        nextEl: ".use-case-swiper-button-next",
        prevEl: ".use-case-swiper-button-prev",
      },
      breakpoints: {
        320: { slidesPerView: 1, spaceBetween: 10 },
        768: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 4, spaceBetween: 20 },
      },
    });
  }

  // Initialize Testimonials Swiper
  if (typeof Swiper !== "undefined") {
    new Swiper(".testimonials-swiper", {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 20,
      pagination: {
        el: ".testimonials-swiper .swiper-pagination",
        clickable: true,
        position: "bottom",
        renderBullet: function (index, className) {
          return (
            '<span class="w-3 h-3 rounded-full mx-1 ' + className + '"></span>'
          );
        },
      },
      breakpoints: {
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });
  }

  // -- ANALYTICS CHARTS --
  if (typeof Chart !== "undefined") {
    // 1. Daily Performance Chart (Bar)
    const dailyCtx = document.getElementById("dailyPerformanceChart");
    if (dailyCtx) {
      // ... (Chart.js code for bar chart as provided before)
      const deliveryData = [
        { name: "Mon", delivered: 4200, failed: 100 },
        { name: "Tue", delivered: 3800, failed: 150 },
        { name: "Wed", delivered: 5200, failed: 80 },
        { name: "Thu", delivered: 4800, failed: 120 },
        { name: "Fri", delivered: 6200, failed: 90 },
        { name: "Sat", delivered: 3500, failed: 60 },
        { name: "Sun", delivered: 2800, failed: 40 },
      ];
      new Chart(dailyCtx, {
        type: "bar",
        data: {
          labels: deliveryData.map((d) => d.name),
          datasets: [
            {
              label: "Delivered",
              data: deliveryData.map((d) => d.delivered),
              backgroundColor: "#38bdf8",
              borderRadius: 4,
            },
            {
              label: "Failed",
              data: deliveryData.map((d) => d.failed),
              backgroundColor: "#ef4444",
              borderRadius: 4,
            },
          ],
        },
        options: {
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true },
          },
        },
      });
    }

    // 2. Message Status Chart (Doughnut)
    const statusCtx = document.getElementById("statusDistributionChart");
    if (statusCtx) {
      // ... (Chart.js code for doughnut chart as provided before)
      const statusData = [
        { name: "Delivered", value: 94.2, color: "#10B981" },
        { name: "Pending", value: 3.8, color: "#F59E0B" },
        { name: "Failed", value: 2.0, color: "#EF4444" },
      ];
      new Chart(statusCtx, {
        type: "doughnut",
        data: {
          labels: statusData.map((d) => d.name),
          datasets: [
            {
              data: statusData.map((d) => d.value),
              backgroundColor: statusData.map((d) => d.color),
              borderWidth: 0,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          cutout: "70%",
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }

    // 3. Delivery Rate Trends (Line)
    const trendsCtx = document.getElementById("deliveryTrendsChart");
    if (trendsCtx) {
      // ... (Chart.js code for line chart as provided before)
      const trendsData = [
        { month: "Jan", rate: 92.1 },
        { month: "Feb", rate: 93.5 },
        { month: "Mar", rate: 94.2 },
        { month: "Apr", rate: 95.1 },
        { month: "May", rate: 94.8 },
        { month: "Jun", rate: 96.2 },
      ];
      new Chart(trendsCtx, {
        type: "line",
        data: {
          labels: trendsData.map((d) => d.month),
          datasets: [
            {
              label: "Delivery Rate",
              data: trendsData.map((d) => d.rate),
              borderColor: "#38bdf8",
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointBackgroundColor: "#38bdf8",
            },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: false, suggestedMin: 90, suggestedMax: 100 },
          },
        },
      });
    }
  }

  // -- DEVELOPER TABS & COPY --
  const codeTabsTriggers = document.getElementById("code-tabs-triggers");
  const codeTabsContent = document.getElementById("code-tabs-content");

  if (codeTabsTriggers && codeTabsContent) {
    // ... (Tab switching and copy-to-clipboard logic as provided before)
    // Tab switching logic
    codeTabsTriggers.addEventListener("click", (e) => {
      if (e.target.matches(".tab-trigger")) {
        const targetId = e.target.dataset.target;

        // Update active trigger
        codeTabsTriggers
          .querySelectorAll(".tab-trigger")
          .forEach((trigger) => trigger.classList.remove("active"));
        e.target.classList.add("active");

        // Update active content
        codeTabsContent
          .querySelectorAll(".tab-content")
          .forEach((content) => content.classList.remove("active"));
        document.getElementById(targetId).classList.add("active");
      }
    });

    // Copy to clipboard logic
    codeTabsContent.addEventListener("click", (e) => {
      const copyBtn = e.target.closest(".copy-code-btn");
      if (copyBtn) {
        const codeBlock = copyBtn.previousElementSibling.querySelector("code");
        if (codeBlock) {
          navigator.clipboard.writeText(codeBlock.textContent).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = `<i class="fa-solid fa-check w-4 h-4 text-green-500"></i>`;
            setTimeout(() => {
              copyBtn.innerHTML = originalIcon;
            }, 2000);
          });
        }
      }
    });
  }

  // FAQ Accordion logic with chevron toggle
  document.querySelectorAll('.faq-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var content = btn.parentElement.querySelector('.faq-content');
      var chevron = btn.querySelector('.faq-chevron');
      if (!content) return;
      var isOpen = !content.classList.contains('hidden');
      // Close all
      document.querySelectorAll('.faq-content').forEach(function (el) {
        el.classList.add('hidden');
        el.classList.remove('accordion-fade-in');
      });
      document.querySelectorAll('.faq-chevron').forEach(function (icon) {
        icon.classList.remove('rotate-180');
      });
      // Open this one if it was closed
      if (!isOpen) {
        content.classList.remove('hidden');
        // Force reflow for animation
        void content.offsetWidth;
        content.classList.add('accordion-fade-in');
        if (chevron) chevron.classList.add('rotate-180');
      }
    });
  });

  // Re-initialize AOS to account for new elements
  if (typeof AOS !== "undefined") {
    AOS.refresh();
  }
});
