# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a media asset repository for Der Reiskoch (The Rice Chef), a personal Thai food blog. It serves as centralized storage for external media assets including Pinterest pins, YouTube thumbnails, Shopify product images, event flyers, and food photography. The repository uses Git as a CDN for media files that are referenced by other applications.

**Git LFS**: This repository uses Git Large File Storage (LFS) to efficiently manage 2,588 media files (~2.6GB). All image files (*.jpg, *.jpeg, *.JPG, *.webp, *.png) are tracked by LFS.

## Architecture

### Directory Structure

The repository is organized by media type and usage:

- **youtube/** - YouTube video thumbnails (1000+ files)
  - Files named by video ID (e.g., `2hdlc6szjZs.jpg`)
  - Formats: .jpg, .webp

- **pins/** - Pinterest pin images organized in a hierarchical structure
  - Structure: `pins/XXXX/YYYY/pin.jpg` (4-digit categories with 4-digit subcategories)
  - Example: `pins/0100/0106/pin.jpg`
  - Categories range from 0000-1300

- **ahaan-thai/** - Thai food dish photography organized alphabetically
  - Structure: `ahaan-thai/[a-z]/dish_name.jpg` (first letter of dish name)
  - Example: `ahaan-thai/g/gai_thod_hat_yai.jpg`
  - File names use Thai transliteration with underscores

- **shopify/** - Product images for Shopify store
  - Flat structure with descriptive Thai dish names
  - Example: `gaeng_panaeng_nuea.jpg`

- **flyer/** - Event/marketing flyers organized by year
  - Structure: `flyer/YYYY/YYYYMMDD_location.jpg`
  - Example: `flyer/2025/20250607_oberhausen.jpg`

- **diary/** - Calendar/diary images organized by year
  - Structure: `diary/YYYY/`

### Build and Deployment

**Deploy new media:**
```bash
npm run deploy
```
This command:
1. Runs `.scripts/prepareFiles.js` to normalize image extensions (.JPG, .jpeg → .jpg)
2. Stages all changes with `git add .`
3. Creates a commit with message "auto-deploy: added new media"
4. Pushes to remote repository

**Clear Git history:**
```bash
npm run clear:gitHistory
```
This command runs `.scripts/clearGitHistory.js` which:
1. Reads repository URL from package.json
2. Deletes .git directory
3. Reinitializes repository with Git LFS support
4. Configures LFS tracking for all image file types
5. Creates fresh "Initial commit (history reset) with Git LFS"
6. Force pushes to origin/main

This is useful for keeping repository size manageable when dealing with large binary files. The script automatically sets up Git LFS tracking during reinitialization.

## Development Workflow

### Adding New Media Files

1. Place files in appropriate directory following naming conventions
2. Run `npm run deploy` to normalize extensions and push changes
3. Files will be available via Git URL for consumption by other applications

### Naming Conventions

- **YouTube thumbnails**: Use video ID as filename
- **Shopify products**: Use Thai dish name in lowercase with underscores
- **Flyers**: Use `YYYYMMDD_location.jpg` format
- **Ahaan Thai**: Use Thai transliteration with underscores, organized by first letter
- **Pins**: Follow hierarchical numbering `XXXX/YYYY/pin.jpg`

### File Format Requirements

- The prepareFiles script normalizes extensions to lowercase `.jpg`
- Supported image formats: JPG/JPEG (normalized to .jpg), WebP
- Keep `.JPG` and `.jpeg` extensions when adding files; deployment will normalize them

## Git LFS Configuration

This repository uses Git Large File Storage (LFS) to efficiently store large media files:

- **Tracked file types**: *.jpg, *.jpeg, *.JPG, *.webp, *.png
- **Total LFS objects**: 2,588 files (~2.6GB)
- **Configuration**: See `.gitattributes` for LFS tracking rules
- **LFS is required**: You must have Git LFS installed (`git lfs install`) to work with this repository

## Important Notes

- Git LFS must be installed on your system to clone/work with this repository
- The clear:gitHistory script automatically configures LFS when resetting history
- Node version is managed by Volta (v20.19.0)
- All deployment is automated through npm scripts; manual git operations not needed
