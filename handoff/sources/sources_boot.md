# Sources: boot (what your computer does when you press power)
VERIFIED (fetched this session)
- PSU waits >=100 ms after rails stabilise before PWR_OK; typically 0.1-0.5 s; PWR_OK feeds the timer chip that controls CPU reset — https://en.wikipedia.org/wiki/Power_good_signal (summarises ATX spec)
- x86 reset vector is physical FFFFFFF0h; first instruction fetched there, firmware lives there — https://en.wikipedia.org/wiki/Reset_vector
- UEFI PI phases: SEC runs before PEI; PEI prepares the machine; DXE has drivers/dispatcher (Vol. II); Boot Manager — https://uefi.org/specs/PI/1.9/Frontmatter/V1_Frontmatter.html , https://uefi.org/specs/PI/1.9/V1_Introduction.html
- POST: checks CPU/firmware, initialises and sizes memory, finds boot devices; one short beep commonly = OK but beep codes vary by vendor — https://en.wikipedia.org/wiki/Power-on_self-test
- Boot manager walks BootOrder list of Boot#### options in order, LoadImage/StartImage; fallback \EFI\BOOT\BOOTx64.EFI — https://uefi.org/specs/UEFI/2.10/03_Boot_Manager.html
- EFI System Partition is FAT32 (FAT12/16 removable), boot loaders are .EFI apps — https://uefi.org/specs/UEFI/2.10/13_Protocols_Media_Access.html
- Boot loader loads kernel + initial RAM disk; kernel mounts/executes init — https://www.kernel.org/doc/html/latest/admin-guide/initrd.html
- initramfs is a gzipped cpio archive unpacked into rootfs; kernel runs /init as PID 1; it finds/mounts real root and switches — https://www.kernel.org/doc/html/latest/filesystems/ramfs-rootfs-initramfs.html
- systemd as PID 1: first process, mounts /proc /sys /dev, starts units, activates default.target — https://www.freedesktop.org/software/systemd/man/latest/systemd.html
DROPPED (unverified): Windows/macOS boot chain names, "boot takes N seconds", Secure Boot detail, DXE-purpose wording beyond "loads drivers".
FONT: VT323 (SIL OFL 1.1, Peter Hull) from styles/microgame fonts.
