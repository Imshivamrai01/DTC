import os
import re

directory = 'src/app'

replacements = [
    (r"rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.0[0-9]*\s*\)", "var(--color-surface-hover)"),
    (r"rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.[1-9][0-9]*\s*\)", "var(--color-border)"),
    (r"rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.0[789][0-9]*\s*\)", "var(--color-border)"),
]

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for pattern, replacement in replacements:
                new_content = re.sub(pattern, replacement, new_content)
                
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
