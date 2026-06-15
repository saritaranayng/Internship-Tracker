import re

with open('/home/aviox/myproject/Internship-Tracker/views/studentdashboard.ejs', 'r') as f:
    content = f.read()

# 1. Add CSS
css_to_add = """
        .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 24px; }
        .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .toggle-switch input:checked + .toggle-slider { background-color: var(--primary); }
        .toggle-switch input:checked + .toggle-slider:before { transform: translateX(20px); }
"""
content = content.replace("</style>", css_to_add + "</style>")

# 2. Replace the tab-settings block
old_tab_settings = """            <!-- Settings Tab -->
            <div id="tab-settings" class="tab-content">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;">
                    <div class="profile-card">
                        <h3 style="margin-bottom: 20px;">Profile Details</h3>
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <div>
                                <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Full Name</label>
                                <p><%= student.firstname %> <%= student.lastname %></p>
                            </div>
                            <div>
                                <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Roll Number</label>
                                <p><%= student.rollno %></p>
                            </div>
                            <div>
                                <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Course</label>
                                <p><%= student.course %></p>
                            </div>
                            <div>
                                <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Department</label>
                                <p><%= student.department %></p>
                            </div>
                            <div>
                                <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Email</label>
                                <p><%= student.email %></p>
                            </div>
                        </div>
                    </div>

                    <div class="profile-card">
                        <h3 style="margin-bottom: 20px;">Change Password</h3>
                        <form action="/student/changepassword" method="POST">
                            <div class="form-group">
                                <label>Current Password</label>
                                <input type="password" name="currentPassword" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>New Password</label>
                                <input type="password" name="newPassword" class="form-control" required minlength="6">
                            </div>
                            <button type="submit" class="auth-btn">Update Password</button>
                        </form>
                    </div>
                </div>
            </div>"""

new_tab_settings = """            <!-- Settings Tab -->
            <div id="tab-settings" class="tab-content">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;">
                    
                    <!-- 1. Edit Profile -->
                    <div class="profile-card">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <h3 style="margin: 0;">Edit Profile</h3>
                        </div>
                        <form action="/student/updateprofile" method="POST" enctype="multipart/form-data">
                            <div style="display: flex; justify-content: center; margin-bottom: 24px;">
                                <div style="position: relative; width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 2px dashed rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer;" onclick="document.getElementById('profilePicUpload').click()">
                                    <% if (student.profilePicture) { %>
                                        <img src="<%= student.profilePicture.startsWith('http') ? student.profilePicture : '/uploads/' + student.profilePicture %>" style="width: 100%; height: 100%; object-fit: cover;" alt="Profile Picture">
                                    <% } else { %>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    <% } %>
                                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); font-size: 0.65rem; color: white; text-align: center; padding: 4px 0; opacity: 0; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">Change</div>
                                </div>
                                <input type="file" id="profilePicUpload" name="profilePicture" style="display: none;" accept="image/*" onchange="previewProfilePic(this)">
                            </div>
                            
                            <div class="form-group">
                                <label>First Name</label>
                                <input type="text" name="firstname" class="form-control" value="<%= student.firstname %>" required>
                            </div>
                            <div class="form-group">
                                <label>Last Name</label>
                                <input type="text" name="lastname" class="form-control" value="<%= student.lastname %>" required>
                            </div>
                            <div class="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" class="form-control" value="<%= student.email %>" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 24px;">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" class="form-control" value="<%= student.phone || '' %>" placeholder="+1 234 567 8900">
                            </div>
                            <button type="submit" class="auth-btn" style="width: 100%;">Save Changes</button>
                        </form>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 32px;">
                        <!-- 2. Notification Preferences -->
                        <div class="profile-card">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                <h3 style="margin: 0;">Notifications</h3>
                            </div>
                            <form action="/student/updatepreferences" method="POST" id="preferencesForm">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <div>
                                        <p style="margin: 0; font-weight: 500;">Weekly Reminders</p>
                                        <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--text-muted);">Get reminded to submit your log.</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" name="weeklyReminders" onchange="submitPreferences()" <%= (!student.preferences || student.preferences.weeklyReminders) ? 'checked' : '' %>>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <div>
                                        <p style="margin: 0; font-weight: 500;">Feedback Notifications</p>
                                        <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--text-muted);">Alerts when a mentor replies.</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" name="feedbackNotifs" onchange="submitPreferences()" <%= (!student.preferences || student.preferences.feedbackNotifs) ? 'checked' : '' %>>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                                    <div>
                                        <p style="margin: 0; font-weight: 500;">Evaluation Updates</p>
                                        <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--text-muted);">When your log is approved or rejected.</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" name="gradeNotifs" onchange="submitPreferences()" <%= (!student.preferences || student.preferences.gradeNotifs) ? 'checked' : '' %>>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </form>
                        </div>

                        <!-- 3. Appearance Settings -->
                        <div class="profile-card">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                                <h3 style="margin: 0;">Appearance</h3>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                                <div>
                                    <p style="margin: 0; font-weight: 500;">Dark Theme</p>
                                    <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--text-muted);">Toggle between light and dark modes.</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="themeToggle" onchange="toggleTheme()" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; margin-top: 32px;">
                    <!-- 5. Security Enhancements -->
                    <div class="profile-card">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <h3 style="margin: 0;">Security</h3>
                        </div>
                        <form action="/student/changepassword" method="POST" id="passwordForm">
                            <div class="form-group" style="position: relative;">
                                <label>Current Password</label>
                                <input type="password" id="currentPassword" name="currentPassword" class="form-control" required style="padding-right: 40px;">
                                <button type="button" onclick="togglePasswordVisibility('currentPassword')" style="position: absolute; right: 12px; top: 38px; background: none; border: none; color: var(--text-muted); cursor: pointer;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                            </div>
                            <div class="form-group" style="position: relative;">
                                <label>New Password</label>
                                <input type="password" id="newPassword" name="newPassword" class="form-control" required minlength="6" style="padding-right: 40px;" oninput="checkPasswordStrength()">
                                <button type="button" onclick="togglePasswordVisibility('newPassword')" style="position: absolute; right: 12px; top: 38px; background: none; border: none; color: var(--text-muted); cursor: pointer;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                                <div style="height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 8px; overflow: hidden;">
                                    <div id="passwordStrengthBar" style="height: 100%; width: 0%; background: #ef4444; transition: 0.3s;"></div>
                                </div>
                                <p id="passwordStrengthText" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; text-align: right;">Strength</p>
                            </div>
                            <div class="form-group" style="position: relative; margin-bottom: 24px;">
                                <label>Confirm Password</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" class="form-control" required minlength="6" style="padding-right: 40px;" oninput="checkPasswordMatch()">
                                <button type="button" onclick="togglePasswordVisibility('confirmPassword')" style="position: absolute; right: 12px; top: 38px; background: none; border: none; color: var(--text-muted); cursor: pointer;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                                <p id="passwordMatchError" style="font-size: 0.75rem; color: #ef4444; margin-top: 4px; display: none;">Passwords do not match</p>
                            </div>
                            <button type="submit" id="updatePasswordBtn" class="auth-btn" style="width: 100%;">Update Password</button>
                        </form>
                    </div>

                    <!-- 4. Account Settings -->
                    <div class="profile-card" style="border: 1px solid rgba(239, 68, 68, 0.2);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            <h3 style="margin: 0; color: #ef4444;">Danger Zone</h3>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <div>
                                    <p style="margin: 0; font-weight: 500;">Logout All Devices</p>
                                    <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--text-muted);">End all active sessions immediately.</p>
                                </div>
                                <form action="/student/logout" method="GET" style="margin: 0;">
                                    <button type="submit" style="padding: 8px 16px; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; font-size: 0.85rem;">Logout All</button>
                                </form>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <div>
                                    <p style="margin: 0; font-weight: 500;">Deactivate Account</p>
                                    <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--text-muted);">Temporarily disable your account.</p>
                                </div>
                                <button type="button" onclick="alert('Account deactivated.')" style="padding: 8px 16px; background: rgba(234, 179, 8, 0.1); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 8px; cursor: pointer; font-size: 0.85rem;">Deactivate</button>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <p style="margin: 0; font-weight: 500; color: #ef4444;">Delete Account</p>
                                    <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--text-muted);">Permanently remove your account and data.</p>
                                </div>
                                <button type="button" onclick="openAccountDeleteModal()" style="padding: 8px 16px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; cursor: pointer; font-size: 0.85rem;">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>"""

if old_tab_settings in content:
    content = content.replace(old_tab_settings, new_tab_settings)
else:
    print("Could not find the old tab-settings block.")

# 3. Add JS functions
js_to_add = """
        function previewProfilePic(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const container = input.parentElement.querySelector('div');
                    container.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;" alt="Profile Preview">
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); font-size: 0.65rem; color: white; text-align: center; padding: 4px 0; opacity: 0; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">Change</div>`;
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

        function submitPreferences() {
            const form = document.getElementById('preferencesForm');
            const formData = new FormData(form);
            fetch('/student/updatepreferences', {
                method: 'POST',
                body: new URLSearchParams(formData)
            }).then(res => res.json()).then(data => {
                Toastify({ text: "Preferences saved", duration: 2000, style: { background: "#10b981", borderRadius: "8px" } }).showToast();
            }).catch(e => {
                Toastify({ text: "Failed to save preferences", duration: 2000, style: { background: "#ef4444", borderRadius: "8px" } }).showToast();
            });
        }

        function toggleTheme() {
            const isDark = document.getElementById('themeToggle').checked;
            document.body.style.filter = isDark ? 'none' : 'invert(1) hue-rotate(180deg)';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }

        // Initialize theme on load
        if(localStorage.getItem('theme') === 'light') {
            document.getElementById('themeToggle').checked = false;
            document.body.style.filter = 'invert(1) hue-rotate(180deg)';
        }

        function togglePasswordVisibility(id) {
            const input = document.getElementById(id);
            if (input.type === "password") {
                input.type = "text";
            } else {
                input.type = "password";
            }
        }

        function checkPasswordStrength() {
            const val = document.getElementById('newPassword').value;
            const bar = document.getElementById('passwordStrengthBar');
            const text = document.getElementById('passwordStrengthText');
            let strength = 0;
            
            if(val.length >= 6) strength += 1;
            if(val.length >= 10) strength += 1;
            if(/[A-Z]/.test(val) && /[0-9]/.test(val)) strength += 1;
            
            if (strength === 0) {
                bar.style.width = '0%';
                text.innerText = 'Strength';
            } else if (strength === 1) {
                bar.style.width = '33%';
                bar.style.background = '#ef4444';
                text.innerText = 'Weak';
            } else if (strength === 2) {
                bar.style.width = '66%';
                bar.style.background = '#eab308';
                text.innerText = 'Medium';
            } else {
                bar.style.width = '100%';
                bar.style.background = '#10b981';
                text.innerText = 'Strong';
            }
            checkPasswordMatch();
        }

        function checkPasswordMatch() {
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            const error = document.getElementById('passwordMatchError');
            const btn = document.getElementById('updatePasswordBtn');
            
            if (confirmPass.length > 0 && newPass !== confirmPass) {
                error.style.display = 'block';
                btn.disabled = true;
            } else {
                error.style.display = 'none';
                btn.disabled = false;
            }
        }

        function openAccountDeleteModal() {
            document.getElementById('accountDeleteModal').classList.add('active');
        }
        function closeAccountDeleteModal() {
            document.getElementById('accountDeleteModal').classList.remove('active');
            document.getElementById('deleteRollInput').value = '';
            document.getElementById('confirmDeleteAccBtn').disabled = true;
        }
        function verifyDeleteRoll() {
            const input = document.getElementById('deleteRollInput').value;
            const btn = document.getElementById('confirmDeleteAccBtn');
            if(input === '<%= student.rollno %>') {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        }
"""
content = content.replace("function switchTab(tabId) {", js_to_add + "\n        function switchTab(tabId) {")

# 4. Add the Delete Modal HTML
modal_html = """
  <div id="accountDeleteModal" class="loader-overlay" style="z-index: 10000; align-items: center; justify-content: center;">
      <div style="background: var(--card-bg); padding: 32px; border-radius: 16px; border: 1px solid var(--glass-border); width: 90%; max-width: 400px; backdrop-filter: blur(20px); text-align: center;">
          <div style="display: flex; justify-content: center; margin-bottom: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); display: flex; align-items: center; justify-content: center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
          </div>
          <h3 style="margin-bottom: 16px; color: white;">Delete Account</h3>
          <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 0.9rem;">This action is permanent and cannot be undone. All your logs and data will be erased. Type your roll number <strong><%= student.rollno %></strong> to confirm.</p>
          <form action="/student/deleteaccount" method="POST" style="margin: 0; text-align: left;">
              <input type="text" id="deleteRollInput" class="form-control" placeholder="Type roll number here" oninput="verifyDeleteRoll()" style="margin-bottom: 24px; text-align: center;" required>
              <div style="display: flex; gap: 12px; justify-content: center;">
                  <button type="button" onclick="closeAccountDeleteModal()" style="padding: 10px 20px; background: transparent; color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; font-size: 0.9rem; flex: 1;">Cancel</button>
                  <button type="submit" id="confirmDeleteAccBtn" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; flex: 1;" disabled>Delete Forever</button>
              </div>
          </form>
      </div>
  </div>
"""

content = content.replace("<!-- Global Loader -->", modal_html + "\n  <!-- Global Loader -->")

with open('/home/aviox/myproject/Internship-Tracker/views/studentdashboard.ejs', 'w') as f:
    f.write(content)
print("Finished updates to EJS")
