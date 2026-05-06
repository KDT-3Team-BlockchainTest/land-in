import React from 'react';

const Header = () => {
  return (  
    <header className=" text-white p-4">
        <div className="flex mx-auto max-w-7xl items-center justify-between">
            <h2>Place</h2>
            <div>
                <p className="hover:none cursor-pointer">로그인</p>
            </div>
        </div>
      
    </header>
  );
};

export default Header;
