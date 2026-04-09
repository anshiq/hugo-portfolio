---
date: '2026-04-05T12:49:24+05:30'
title: 'Setup Pharo VM Development Environment on macOS'
---

A practical guide to forking, building, and contributing to the PharoVM from scratch.
Official Pharo VM Guide at: [Github](https://github.com/pharo-project/pharo-vm/wiki/Detailed-Development-Guide)

---

## Who Is This For?

This guide is for developers who want to contribute to the **PharoVM** — the virtual machine that powers the Pharo programming language. By the end of this guide you will have:

- A forked and cloned copy of the `pharo-vm` repository
- A fully compiled Pharo VM binary built on your own machine
- The VM source code loaded inside your Pharo image via Iceberg
- A working git workflow to make changes, commit, and push contributions

---

## Prerequisites

Before starting, make sure you have the following installed on your Mac:

- **Xcode Command Line Tools** — run `xcode-select --install`
- **CMake** — install via Homebrew: `brew install cmake`
- **Git** — comes with Xcode tools

Verify everything is ready:

```bash
cmake --version
make --version
gcc --version
git --version
```

---

## Step 1 — Fork the Repository

Go to the official pharo-vm repository on GitHub:

```
https://github.com/pharo-project/pharo-vm
```

Click the **Fork** button in the top right corner. This creates your own copy of the repository under your GitHub account, for example:

```
https://github.com/YOUR_USERNAME/pharo-vm
```

> **Why fork?** Forking lets you freely make changes and push commits without needing write access to the official repository. When your change is ready, you can open a Pull Request to contribute it back.

---

## Step 2 — Clone Your Fork

Open Terminal and clone your fork to your local machine:

```bash
cd ~/Documents/projects
git clone https://github.com/YOUR_USERNAME/pharo-vm.git
cd pharo-vm
```

Add the official repository as an `upstream` remote so you can pull in future updates:

```bash
git remote add upstream https://github.com/pharo-project/pharo-vm.git
git remote -v
```

---

## Step 3 — Build the VM

Now let's compile the VM from source. Create a build directory and run CMake:

```bash
cd ~/Documents/projects/pharo-vm
mkdir build
cd build
cmake .. 
```

Once CMake finishes configuring, start the build:

```bash
make -j$(sysctl -n hw.logicalcpu) install
```

> **Note:** The first build takes **10–30 minutes** because it downloads Pharo, generates C source files from Smalltalk, and compiles everything. Subsequent builds are much faster since dependencies are cached. The `-j` flag enables parallel compilation to speed things up.

When it completes, your compiled VM binary will be at:

```
build/build/dist/Pharo.app/Contents/MacOS/Pharo
```

---

## Step 4 — Verify the Build

Run this to confirm your VM compiled successfully:

```bash
./build/dist/Pharo.app/Contents/MacOS/Pharo --version
```

You should see output like:

```
Pharo v10.3.3 built on Apr 8 2026 00:15:20 Compiler: Apple LLVM 17.0.0
```

The build date confirms this is **your fresh local build**.

---

## Step 5 — Open the VMMaker Image

The build process generates a special Pharo image that has all the VM source code pre-loaded. It lives at:

```
build/build/vmmaker/image/VMMaker.image
```

Launch it using **your compiled VM binary**:

```bash
./build/dist/Pharo.app/Contents/MacOS/Pharo \
  build/build/vmmaker/image/VMMaker.image
  "was not working is my case so, run:"
./build/dist/Pharo.app/Contents/MacOS/Pharo
"and select VMMaker.image manualy navigating image path"

```

This opens a full Pharo environment with all VM packages loaded and ready to edit.

---

## Step 6 — Import Your Repo Into Iceberg

Iceberg is Pharo's built-in git client. We need to tell it about your local clone so you can commit changes from inside the image.

1. Open Iceberg with **CMD + O + I**
2. Click the **+** button to add a repository
3. Choose **"Load from existing clone on disk"**
4. Navigate to `~/Documents/projects/pharo-vm`
5. Click **OK**

You should now see the **pharo-vm** repository listed in Iceberg with all its packages.

---

## Step 7 — Checkout a New Branch

Before making any changes, always work on a dedicated branch. In Iceberg:

1. Click on your **pharo-vm** repository
2. Click **"Branch"** in the toolbar
3. Click **"New branch"**
4. Give it a descriptive name, for example:
   ```
   feature/my-custom-primitive
   ```
5. Click **Create**

Alternatively, from Terminal:

```bash
cd ~/Documents/projects/pharo-vm
git checkout -b feature/my-custom-primitive
```

---

## Step 8 — Make Your Changes

Now you're ready to edit the VM source code inside Pharo. Open the System Browser with **CMD + O + B** and navigate to the package and class you want to modify.

For example, to add a simple custom ASCII-printing class in the `Printf` package, navigate to the `Printf` package in the System Browser and define a new class:

```smalltalk
Object << #PrintMyNameASCII
    slots: { #name };
    package: 'Printf'
```

Then add a setter method:

```smalltalk
setName: aString
    name := aString
```

And add the ASCII-printing method:

```smalltalk
printMyASCIIName
    | result |
    result := OrderedCollection new.
    name do: [:c | result add: c asciiValue].
    ^ result printString.
```

> **Note:** `asciiValue` is the correct Pharo message to get the integer ASCII/Unicode code point of a `Character`. The message `value` also works on characters but `asciiValue` is more explicit and idiomatic.

Save each method with **CMD + S**.

---

## Step 9 — Commit Your Changes With Iceberg

Once you're happy with your edits:

1. Open Iceberg with **CMD + O + I**
2. Click on **pharo-vm** — you'll see a dirty indicator showing uncommitted changes
3. Click **"Changes"** to review exactly what you modified
4. Click **"Commit"**
5. Write a clear commit message, for example:
   ```
   Add PrintMyNameASCII class to Printf package
   ```
6. Click **Commit**

---

## Step 10 — Rebuild the VM With Your Changes

Now rebuild the VM to compile your changes into a new binary. Since the VMMaker image is already set up, use the faster rebuild command from inside the `build` directory:

```bash
cd ~/Documents/projects/pharo-vm/build
cmake .. -DGENERATE_VMMAKER=OFF
make -j$(sysctl -n hw.logicalcpu) install
```

This skips regenerating the VMMaker image and goes straight to generating C files and compiling — much faster than the first build.

---

## Step 11 — Test Your New VM

Run the new binary to confirm your changes compiled successfully:

```bash
./build/dist/Pharo.app/Contents/MacOS/Pharo --version
```

Then launch the VMMaker image with your new VM and open a Playground (**CMD + O + W**) to test your change:

```smalltalk
| k |
k := PrintMyNameASCII new.
k setName: 'anshik'.
k printMyASCIIName.
"output should be: an OrderedCollection(97 110 115 104 105 107), numbers represent ascii of your given string"

```


---

## Step 12 — Push Your Branch

Once everything works, push your branch to your fork on GitHub:

```bash
cd ~/Documents/projects/pharo-vm
git push origin feature/my-custom-primitive
```

Then go to your fork on GitHub and open a **Pull Request** against the original `pharo-project/pharo-vm` repository. Describe what your change does and why, and the maintainers will review it.

---