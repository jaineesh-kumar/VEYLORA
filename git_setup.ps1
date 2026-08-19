git config --global user.email "jaineesh.makwana001@gmail.com"
git config --global user.name "jaineesh-kumar"

if (-not (Test-Path .git)) {
    git init
}

git branch -M main

$remote = git remote
if ($remote -contains "origin") {
    git remote remove origin
}
git remote add origin https://github.com/jaineesh-kumar/VEYLORA.git

# Stage root files (QA / Config)
git add .gitignore .env.example README.md project_structure.txt CryptML_Thesis.txt design-v2-glass.md design.md
git commit -m "chore: initial project setup and QA configurations`n`nCo-authored-by: ParadoxSolver <ParadoxSolver@users.noreply.github.com>`nCo-authored-by: jaineesh-kumar <jaineesh.makwana001@gmail.com>`nCo-authored-by: Omm2556 <Omm2556@users.noreply.github.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="imvk90 <imvk90@users.noreply.github.com>"

# Stage Frontend
git add Frontend/
git commit -m "feat: frontend UI and layout implementation`n`nCo-authored-by: imvk90 <imvk90@users.noreply.github.com>`nCo-authored-by: jaineesh-kumar <jaineesh.makwana001@gmail.com>`nCo-authored-by: Omm2556 <Omm2556@users.noreply.github.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="ParadoxSolver <ParadoxSolver@users.noreply.github.com>"

# Stage Backend
git add Backend/
git commit -m "feat: backend architecture and ML model setup`n`nCo-authored-by: imvk90 <imvk90@users.noreply.github.com>`nCo-authored-by: ParadoxSolver <ParadoxSolver@users.noreply.github.com>`nCo-authored-by: Omm2556 <Omm2556@users.noreply.github.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="jaineesh-kumar <jaineesh.makwana001@gmail.com>"

# Any remaining files or refactoring optimizations
git add .
git commit -m "refactor: project-wide optimizations and reviews`n`nCo-authored-by: imvk90 <imvk90@users.noreply.github.com>`nCo-authored-by: ParadoxSolver <ParadoxSolver@users.noreply.github.com>`nCo-authored-by: jaineesh-kumar <jaineesh.makwana001@gmail.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="Omm2556 <Omm2556@users.noreply.github.com>"

git push -u origin main
