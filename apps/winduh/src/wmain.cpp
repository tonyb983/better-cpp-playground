// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#ifndef UNICODE
    #define UNICODE
#endif

#include <string>

#include <fmt/format.h>
#include <fmt/os.h>
#include <fmt/xchar.h>
#include <gsl/gsl>

#include <Shobjidl.h>  // IFileDialog
#include <Windows.h>

#define FAIL_RETURN(hr) \
    do { \
        if (FAILED(hr)) { \
            return hr; \
        } \
    } while (0)

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, PWSTR pCmdLine, int nCmdShow) {
    std::wstring outMessage = fmt::format(L"Hello {}", L"Tony");
    OutputDebugStringW(outMessage.c_str());

    HRESULT hr = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED | COINIT_DISABLE_OLE1DDE);
    FAIL_RETURN(hr);
    auto _f1 = gsl::finally([&]() noexcept { CoUninitialize(); });

    IFileOpenDialog* pFileOpen;
    hr = CoCreateInstance(
        CLSID_FileOpenDialog,
        nullptr,
        CLSCTX_ALL,
        IID_IFileOpenDialog,
        reinterpret_cast<void**>(&pFileOpen));
    FAIL_RETURN(hr);
    auto _f2 = gsl::finally([&]() noexcept { pFileOpen->Release(); });

    hr = pFileOpen->Show(nullptr);
    FAIL_RETURN(hr);

    IShellItem* pItem;
    hr = pFileOpen->GetResult(&pItem);
    FAIL_RETURN(hr);
    auto _f3 = gsl::finally([&]() noexcept { pItem->Release(); });

    PWSTR pszFilePath;
    hr = pItem->GetDisplayName(SIGDN_FILESYSPATH, &pszFilePath);
    FAIL_RETURN(hr);
    auto _f4 = gsl::finally([&]() noexcept { CoTaskMemFree(pszFilePath); });

    MessageBoxW(nullptr, pszFilePath, L"File Path", MB_OK);

    return 0;
}
