Remove-Item -Path .\CryptML_Thesis.txt -Force -ErrorAction SilentlyContinue

Remove-Item -Recurse -Force .\.git

git init
git branch -M main
git remote add origin https://github.com/jaineesh-kumar/VEYLORA.git

git add .gitignore .env.example README.md project_structure.txt design-v2-glass.md design.md
git commit -m "Initial commit with project configurations`n`nCo-authored-by: ParadoxSolver <ParadoxSolver@users.noreply.github.com>`nCo-authored-by: jaineesh-kumar <jaineesh.makwana001@gmail.com>`nCo-authored-by: Omm2556 <Omm2556@users.noreply.github.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="imvk90 <imvk90@users.noreply.github.com>"

git add Frontend/
git commit -m "Add frontend application UI`n`nCo-authored-by: imvk90 <imvk90@users.noreply.github.com>`nCo-authored-by: jaineesh-kumar <jaineesh.makwana001@gmail.com>`nCo-authored-by: Omm2556 <Omm2556@users.noreply.github.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="ParadoxSolver <ParadoxSolver@users.noreply.github.com>"

git add Backend/
git commit -m "Add backend services and ML integration`n`nCo-authored-by: imvk90 <imvk90@users.noreply.github.com>`nCo-authored-by: ParadoxSolver <ParadoxSolver@users.noreply.github.com>`nCo-authored-by: Omm2556 <Omm2556@users.noreply.github.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="jaineesh-kumar <jaineesh.makwana001@gmail.com>"

git add .
git commit -m "Update configuration and final refinements`n`nCo-authored-by: imvk90 <imvk90@users.noreply.github.com>`nCo-authored-by: ParadoxSolver <ParadoxSolver@users.noreply.github.com>`nCo-authored-by: jaineesh-kumar <jaineesh.makwana001@gmail.com>`nCo-authored-by: VRAJ-0512 <VRAJ-0512@users.noreply.github.com>" --author="Omm2556 <Omm2556@users.noreply.github.com>"
