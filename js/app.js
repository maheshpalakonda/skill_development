/**
 * Dilshaj Infotech Skill Development Program
 * Pure Static Frontend Logic, Form Validation, LocalStorage Database & Payment Flow
 */

// Local storage key for registrations
const REG_STORAGE_KEY = 'dilshaj_registrations_store';

// Helper to get local stored registrations
function getStoredRegistrations() {
  try {
    const raw = localStorage.getItem(REG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Helper to save registration to local storage
function saveRegistrationLocal(regData) {
  const list = getStoredRegistrations();
  list.unshift(regData);
  localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(list));
  return regData;
}

// Helper to update payment status in local storage
function updateRegistrationStatusLocal(regId, status, paymentId) {
  const list = getStoredRegistrations();
  const item = list.find(r => r.registration_id === regId || r.registrationId === regId);
  if (item) {
    item.payment_status = status;
    item.paymentStatus = status;
    item.payment_id = paymentId;
    localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(list));
    return item;
  }
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFaqAccordion();
  initJourneyTabs();
  initRegistrationForm();
  initModalCloseHandlers();
});

/* ----------------------------------------------------
   1. Navbar Scroll & Mobile Drawer
   ---------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.textContent = isOpen ? '✕' : '☰';
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.textContent = '☰';
      });
    });
  }
}

/* ----------------------------------------------------
   2. FAQ Accordion
   ---------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other FAQs
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      // Toggle current
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
}

/* ----------------------------------------------------
   3. Journey Tabs (10-Day vs 25-Day)
   ---------------------------------------------------- */
function initJourneyTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const timelineViews = document.querySelectorAll('.timeline-view');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabBtns.forEach(b => b.classList.remove('active'));
      timelineViews.forEach(view => view.classList.remove('active'));

      btn.classList.add('active');
      const targetView = document.getElementById(targetId);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });
}

/* ----------------------------------------------------
   4. Registration Form (Pure Static Processing)
   ---------------------------------------------------- */
function initRegistrationForm() {
  const regForm = document.getElementById('registrationForm');
  if (!regForm) return;

  regForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset error states
    clearErrors();

    // Read values
    const studentName = document.getElementById('studentName').value.trim();
    const parentName = document.getElementById('parentName').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const email = document.getElementById('email').value.trim();
    const studentClass = document.getElementById('studentClass').value;
    const school = document.getElementById('school').value.trim();
    const district = document.getElementById('district').value.trim();
    const projectInterest = document.getElementById('projectInterest').value;

    let hasErrors = false;

    // Validation
    if (!studentName || studentName.length < 2) {
      showError('studentName', 'Please enter the student\'s full name.');
      hasErrors = true;
    }

    if (!parentName || parentName.length < 2) {
      showError('parentName', 'Please enter parent/guardian name.');
      hasErrors = true;
    }

    const cleanMobile = mobile.replace(/[\s\-\+]/g, '');
    const validMobile = cleanMobile.startsWith('91') && cleanMobile.length === 12 ? cleanMobile.slice(2) : cleanMobile;
    if (!/^[6-9]\d{9}$/.test(validMobile)) {
      showError('mobile', 'Please enter a valid 10-digit mobile number.');
      hasErrors = true;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Please enter a valid email address.');
      hasErrors = true;
    }

    if (!studentClass) {
      showError('studentClass', 'Please select your class/grade.');
      hasErrors = true;
    }

    if (!school || school.length < 2) {
      showError('school', 'Please provide school or college name.');
      hasErrors = true;
    }

    if (!district || district.length < 2) {
      showError('district', 'Please enter your district.');
      hasErrors = true;
    }

    if (hasErrors) {
      const firstError = document.querySelector('.form-control.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const submitBtn = document.getElementById('submitRegBtn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Processing Registration...</span>';

    setTimeout(() => {
      // Generate Unique Registration ID
      const dateCode = new Date().toISOString().slice(2, 7).replace('-', '');
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const regId = `DIP-${dateCode}-${randomSeq}`;
      const regDate = new Date().toISOString().slice(0, 10);

      const regRecord = {
        registration_id: regId,
        registrationId: regId,
        student_name: studentName,
        studentName: studentName,
        parent_name: parentName,
        parentName: parentName,
        mobile: validMobile,
        email: email,
        student_class: studentClass,
        studentClass: studentClass,
        school: school,
        district: district,
        project_interest: projectInterest,
        projectInterest: projectInterest,
        registration_date: regDate,
        registrationDate: regDate,
        payment_status: 'Pending',
        paymentStatus: 'Pending',
        payment_amount: 499,
        fee: 499,
        payment_id: ''
      };

      // Save to client-side localStorage
      saveRegistrationLocal(regRecord);

      // Show Success Modal
      showSuccessModal(regRecord);
      regForm.reset();

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }, 400);
  });
}

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}Error`);
  if (input) input.classList.add('error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('visible');
  }
}

function clearErrors() {
  document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
}

/* ----------------------------------------------------
   5. Success Modal & Pure Static Payment Flow
   ---------------------------------------------------- */
function showSuccessModal(registration) {
  const modal = document.getElementById('successModal');
  if (!modal) return;

  document.getElementById('modalRegId').textContent = registration.registrationId;
  document.getElementById('modalStudentName').textContent = registration.studentName;
  document.getElementById('modalClass').textContent = registration.studentClass;
  document.getElementById('modalAmount').textContent = `₹${registration.fee}`;
  
  const paymentBtn = document.getElementById('proceedPaymentBtn');
  if (paymentBtn) {
    paymentBtn.onclick = () => handlePaymentProcess(registration);
  }

  modal.classList.add('active');
}

function handlePaymentProcess(registration) {
  const paymentBtn = document.getElementById('proceedPaymentBtn');
  paymentBtn.disabled = true;
  paymentBtn.innerHTML = "<span>Processing Payment...</span>";
  
  setTimeout(() => {
    const mockPayId = "PAY-DEMO-" + Math.floor(100000 + Math.random() * 900000);
    updateRegistrationStatusLocal(registration.registrationId, 'Completed', mockPayId);
    updateModalToPaid(registration.registrationId, mockPayId);
  }, 800);
}

function updateModalToPaid(regId, paymentId) {
  const statusContainer = document.getElementById('modalStatusBox');
  if (statusContainer) {
    statusContainer.innerHTML = `
      <div style="text-align: center; padding: 15px 0;">
        <div style="font-size: 3rem; margin-bottom: 8px;">🎉</div>
        <h3 style="color: #10b981; margin-bottom: 6px;">Payment Confirmed!</h3>
        <p style="color: #94a3b8; font-size: 0.92rem; margin-bottom: 12px;">Your seat for Dilshaj Infotech Skill Development Program has been reserved.</p>
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 12px; border-radius: 8px; font-size: 0.88rem;">
          <div><strong>Payment Ref:</strong> ${paymentId}</div>
          <div><strong>Status:</strong> Confirmed & Enrolled</div>
        </div>
      </div>
    `;
  }
}

function initModalCloseHandlers() {
  const closeBtns = document.querySelectorAll('.modal-close, [data-modal-close]');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });
}
