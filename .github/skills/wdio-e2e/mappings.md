# Step to Intent Mapping

| Step Pattern        | Intent        |
|--------------------|--------------|
| navigate           | navigation   |
| open               | navigation   |
| go to              | navigation   |
| enter              | input        |
| type               | input        |
| click              | click        |
| press              | click        |
| verify             | assertion    |
| check              | assertion    |

---

# Intent to WDIO Mapping

| Intent      | Code Pattern |
|------------|-------------|
| navigation | await browser.url('{{path}}') |
| input      | await element.setValue('{{value}}') |
| click      | await element.click() |
| assertion  | await expect(element).toBeDisplayed() |

---

# Intent to MCP Mapping

| Intent      | MCP Tool     |
|------------|-------------|
| navigation | navigate     |
| input      | setValue     |
| click      | clickElement |
| assertion  | isDisplayed  |

---

# Parsing Rules

Example:

"Enter username 'standard_user'"
? action: input  
? element: usernameInput  
? value: standard_user

"Click login button"
? action: click  
? element: loginButton

"Verify dashboard is displayed"
? action: assertion  
? element: dashboard

---

# Naming Rules

| Input text        | Output name     |
|------------------|----------------|
| login button     | loginButton    |
| username         | usernameInput  |
| password         | passwordInput  |
| dashboard        | dashboard      |

---

# Selector Strategy

Rule priority:
1. [data-test="..."]
2. id
3. css fallback

Examples:
usernameInput ? [data-test="username"]  
loginButton ? [data-test="login-btn"]
``