from PIL import Image
import os

def create_logo_variants(input_path):
    """
    Create different sizes of the logo and favicon
    """
    # Create output directory if it doesn't exist
    os.makedirs('public/images', exist_ok=True)
    
    # Open and convert image to RGBA
    img = Image.open(input_path).convert('RGBA')
    
    # Define sizes for different variants
    sizes = {
        'sm': 64,
        'md': 128,
        'lg': 256
    }
    
    # Create each size variant
    for name, size in sizes.items():
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        output_path = f'public/images/logo-{name}.png'
        resized.save(output_path, 'PNG')
        print(f'Created {output_path}')
    
    # Create favicon
    favicon = img.resize((32, 32), Image.Resampling.LANCZOS)
    favicon_path = 'public/images/favicon.ico'
    favicon.save(favicon_path, 'ICO')
    print(f'Created {favicon_path}')

if __name__ == '__main__':
    # Get the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up one level to project root
    project_root = os.path.dirname(script_dir)
    # Change to project root directory
    os.chdir(project_root)
    
    # Process the logo
    input_path = 'logo.png'  # Assuming the original logo is in the project root
    if os.path.exists(input_path):
        create_logo_variants(input_path)
        print('Logo processing completed successfully!')
    else:
        print(f'Error: Could not find logo file at {input_path}')
        print('Please place the logo.png file in the project root directory.') 