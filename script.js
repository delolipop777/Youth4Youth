document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
        document.querySelector('nav').classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('nav').classList.remove('active');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    document.querySelectorAll('.open-form').forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.getElementById(button.dataset.target);
            modal.style.display = 'block';
        });
    });

    document.querySelectorAll('.close').forEach(span => {
        span.addEventListener('click', () => {
            span.closest('.modal').style.display = 'none';
        });
    });

    window.onclick = function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    };

    function handleFormSubmit(formId, scriptURL, successId) {
        const form        = document.getElementById(formId);
        const successDiv  = document.getElementById(successId);
        const submitBtn   = form.querySelector('button[type="submit"]');

        form.addEventListener("submit", e => {
            e.preventDefault();

            // 1) Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            successDiv.textContent = '';  // clear any old messages

            // 2) Fire the request
            fetch(scriptURL, {
            method: "POST",
            body: new FormData(form)
            })
            .then(response => {
            if (response.ok) {
                // 3a) On success
                submitBtn.innerHTML = 'Submitted!';
                successDiv.textContent = "Your application has been received.";
                form.reset();
            } else {
                // 3b) On server‑side failure
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Apply';
                successDiv.textContent = "Submission failed. Please try again.";
            }
            })
            .catch(error => {
            console.error("Error!", error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Apply';
            successDiv.textContent = "An error occurred. Please try again later.";
            });
        });
    }

    function doPost(e) {
        Logger.log(JSON.stringify(e.parameter));

        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const volunteers   = ss.getSheetByName("Volunteers");
        const ambassadors  = ss.getSheetByName("Ambassadors");
        const messages     = ss.getSheetByName("Messages");

        const type = e.parameter.formType;
        let sheet;
        if (type === "volunteer")    sheet = volunteers;
        else if (type === "ambassador") sheet = ambassadors;
        else if (type === "message")    sheet = messages;
        else return ContentService.createTextOutput("Unknown formType");

        // Build row dynamically based on type
        const now       = new Date();
        const name      = e.parameter["Full Name"] || "";
        const email     = e.parameter.Email || "";
        const phone     = e.parameter.Phone || "";
        const location  = e.parameter.Location || "";
        const skills    = e.parameter.Skills || "";
        const org       = e.parameter.Organization || "";
        const why       = e.parameter.Why || "";
        const subject   = e.parameter.Subject || "";
        const message   = e.parameter.Message || "";

        let row;
        if (type === "message") {
            row = [ now, name, email, subject, message ];
        } else {
            row = [
            now,
            name,
            email,
            phone,
            location,
            (type === "volunteer" ? skills : org),
            (type === "ambassador" ? why : "")
            ];
        }

        sheet.appendRow(row);
        return ContentService.createTextOutput("Success");
    }



    // Replace this with your actual Web App URL
    const scriptURL = "https://script.google.com/macros/s/AKfycbyd66IcoOHL2LXSU0To2w3emdASp2mg0GVUrq6EmdrVuyhJ71sBujYXMeIFapJnff3g/exec";
    
    handleFormSubmit("contactForm", scriptURL, "contactSuccess");
    handleFormSubmit("volunteerForm", scriptURL, "volunteerSuccess");
    handleFormSubmit("ambassadorForm", scriptURL, "ambassadorSuccess");
});
