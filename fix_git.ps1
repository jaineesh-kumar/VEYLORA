Remove-Item -Recurse -Force .\.git

git init
git branch -M main
git remote add origin https://github.com/jaineesh-kumar/VEYLORA.git

git add .gitignore .env.example README.md project_structure.txt CryptML_Thesis.txt design-v2-glass.md design.md
git commit -m "chore: initial project setup and QA configurations`n`nCo-authored-by: ParadoxSolver <ParadoxSolver@users.noreply.github.com>`nCo-authored-by: jaineesh-kumar <jaineesh.makwana001@gmail.com>`nCo-authored-by: Omm2556 <Omm2556@users.noreply.github.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="imvk90 <imvk90@users.noreply.github.com>"

git add Frontend/
git commit -m "feat: frontend UI and layout implementation`n`nCo-authored-by: imvk90 <imvk90@users.noreply.github.com>`nCo-authored-by: jaineesh-kumar <jaineesh.makwana001@gmail.com>`nCo-authored-by: Omm2556 <Omm2556@users.noreply.github.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="ParadoxSolver <ParadoxSolver@users.noreply.github.com>"

git add Backend/
git commit -m "feat: backend architecture and ML model setup`n`nCo-authored-by: imvk90 <imvk90@users.noreply.github.com>`nCo-authored-by: ParadoxSolver <ParadoxSolver@users.noreply.github.com>`nCo-authored-by: Omm2556 <Omm2556@users.noreply.github.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="jaineesh-kumar <jaineesh.makwana001@gmail.com>"

git add .
git commit -m "refactor: project-wide optimizations and reviews`n`nCo-authored-by: imvk90 <imvk90@users.noreply.github.com>`nCo-authored-by: ParadoxSolver <ParadoxSolver@users.noreply.github.com>`nCo-authored-by: jaineesh-kumar <jaineesh.makwana001@gmail.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="Omm2556 <Omm2556@users.noreply.github.com>"

git push -u origin main --force
