# Assignment 5 – Git and GitHub

## Description
This assignment demonstrates how to create a local Git repository, connect it to a remote GitHub repository, and push code using Git commands.

Since this repository already exists locally and on GitHub, the steps below describe the workflow that was followed to set it up and how you can verify it.

## Repository
- **GitHub URL:** https://github.com/ChaitanyaMore37/Full-Stack-Assignments
- **Local Folder:** `Full-Stack-Assignments/`

---

## Steps to Set Up a Git Repository (from scratch)

**1. Open your terminal.**

**2. Navigate to your project folder:**
```
cd path/to/your/project
```

**3. Initialize a new Git repository:**
```
git init
```

**4. Add all files to staging:**
```
git add .
```

**5. Make the first commit:**
```
git commit -m "Initial commit"
```

**6. Rename the branch to main (if needed):**
```
git branch -M main
```

**7. Connect to your GitHub repository:**
```
git remote add origin https://github.com/ChaitanyaMore37/Full-Stack-Assignments.git
```

**8. Push your code to GitHub:**
```
git push -u origin main
```

---

## Verifying This Repository

Run these commands inside the project folder to confirm everything is set up correctly:

```
git status
git branch
git remote -v
git log --oneline
```

---

## Common Git Commands for Daily Use

| Command                        | Purpose                                 |
|--------------------------------|-----------------------------------------|
| `git status`                   | Check which files are changed           |
| `git add .`                    | Stage all changed files                 |
| `git add filename`             | Stage a specific file                   |
| `git commit -m "message"`      | Save staged changes with a message      |
| `git push`                     | Push commits to GitHub                  |
| `git pull`                     | Pull latest changes from GitHub         |
| `git log --oneline`            | View commit history in short form       |
| `git branch`                   | List branches                           |
| `git checkout -b branch-name`  | Create and switch to a new branch       |
